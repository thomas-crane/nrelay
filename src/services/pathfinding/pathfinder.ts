import { Node } from './node';
import { IPoint } from './point';
import { Heap } from './heap';
import { HashSet } from './hash-set';
import { ITile } from '../../models';
import { GroundTileData } from '../../networking/data';
import { ResourceManager } from '../../core';
import { INodeUpdate } from './node-update';

export class Pathfinder {
    private nodes: Node[];
    private w: number;

    constructor(mapWidth: number, walkableNodes?: INodeUpdate[]) {
        this.w = mapWidth;
        this.nodes = new Array<Node>(this.w ** 2);
        for (let i = 0; i < this.w ** 2; i++) {
            const pos = this.getPosition(i);
            this.nodes[i] = new Node(pos.x, pos.y);
        }
        if (walkableNodes) {
            this.updateWalkableNodes(walkableNodes);
        }
    }

    public findPath(start: IPoint, end: IPoint): Promise<IPoint[]> {
        return new Promise((resolve: (path: IPoint[]) => void, reject: (err: Error) => void) => {
            const startNode = this.nodes[this.getIndex(start.x, start.y)];
            const endNode = this.nodes[this.getIndex(end.x, end.y)];

            let openSet = new Heap<Node>(this.nodes.length);
            let closedSet = new HashSet<Node>();

            openSet.add(startNode);

            while (openSet.count > 0) {
                const currentNode = openSet.removeFirst();
                closedSet.add(currentNode);

                if (currentNode.x === end.x && currentNode.y === end.y) {
                    openSet = null;
                    closedSet = null;
                    resolve(this.retracePath(startNode, endNode));
                    return;
                }

                const neighbors = this.getNeighbors(currentNode);
                for (const neighbor of neighbors) {
                    if (!neighbor.walkable || closedSet.contains(neighbor)) {
                        continue;
                    }
                    const moveCost = currentNode.gCost + this.getDistance(currentNode, neighbor);
                    if (moveCost < neighbor.gCost || !openSet.contains(neighbor)) {
                        neighbor.gCost = moveCost;
                        neighbor.hCost = this.getDistance(neighbor, endNode);
                        neighbor.parent = currentNode;

                        if (!openSet.contains(neighbor)) {
                            openSet.add(neighbor);
                        }
                    }
                }
            }
            reject(new Error('No path found.'));
            return;
        });
    }

    public updateWalkableNodes(updates: INodeUpdate[]): void {
        for (let i = 0; i < updates.length; i++) {
            this.nodes[this.getIndex(updates[i].x, updates[i].y)].walkable = updates[i].walkable;
        }
        updates = null;
    }

    public destroy(): void {
        this.nodes = null;
    }

    private simplifyPath(path: Node[]): IPoint[] {
        if (path.length < 2) {
            if (path.length === 0) {
                return [];
            }
            return path.map((p) => {
                return {
                    x: p.x,
                    y: p.y
                };
            });
        }
        const waypoints: IPoint[] = [];
        let lastDirection: IPoint = {
            x: 0,
            y: 0
        };

        for (let i = 1; i < path.length; i++) {
            const direction: IPoint = {
                x: path[i - 1].x - path[i].x,
                y: path[i - 1].y - path[i].y
            };
            if (direction.x !== lastDirection.x || direction.y !== lastDirection.y) {
                // tslint:disable no-bitwise
                if ((direction.x & direction.y) !== 0) {
                // tslint:enable no-bitwise
                    if (direction.x !== lastDirection.x) {
                        waypoints.push({
                            x: path[i - 1].x,
                            y: path[i].y
                        });
                    } else if (direction.y !== lastDirection.y) {
                        waypoints.push({
                            x: path[i].x,
                            y: path[i - 1].y
                        });
                    }
                } else {
                    waypoints.push({
                        x: path[i].x,
                        y: path[i].y
                    });
                }
            }
            lastDirection = direction;
        }
        waypoints.push({
            x: path[path.length - 1].x,
            y: path[path.length - 1].y
        });
        return waypoints;
    }
    private retracePath(start: Node, end: Node): IPoint[] {
        const path: Node[] = [];
        let currentNode = end;
        while (currentNode !== start) {
            path.push(currentNode);
            currentNode = currentNode.parent;
        }
        const points = this.simplifyPath(path.reverse());
        return points;
    }

    private getIndex(x: number, y: number): number {
        return y * this.w + x;
    }

    private getPosition(index: number): { x: number, y: number } {
        const x = index % this.w;
        const y = (index - x) / this.w;
        return { x, y };
    }

    private getNeighbors(node: Node): Node[] {
        const neighbors: Node[] = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                // self
                if (x === 0 && y === 0) {
                    continue;
                }

                const relX = node.x + x;
                const relY = node.y + y;

                if (relX >= 0 && relX < this.w && relY >= 0 && relY < this.w) {
                    neighbors.push(this.nodes[this.getIndex(relX, relY)]);
                }
            }
        }
        return neighbors;
    }

    private getDistance(nodeA: Node, nodeB: Node): number {
        const distX = Math.abs(nodeA.x - nodeB.x);
        const distY = Math.abs(nodeA.y - nodeB.y);

        if (distX > distY) {
            return 14 * distY + 10 * (distX - distY);
        }
        return 14 * distX + 10 * (distY - distX);
    }
}
