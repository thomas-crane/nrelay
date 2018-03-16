import { IObject, IProjectile } from './object';
import { ResourceManager } from '../core/resource-manager';
import { IPoint } from '../services/pathfinding/point';

export class Projectile {

    containerType: number;
    bulletType: number;
    ownerObjectId: number;
    bulletId: number;
    startAngle: number;
    startTime: number;
    startPosition: IPoint;
    containerProperties: IObject;
    projectileProperties: IProjectile;
    damagePlayers: boolean;
    damageEnemies: boolean;
    damage: number;
    currentPosition: IPoint;

    constructor(
        containerType: number,
        bulletType: number,
        ownerObjectId: number,
        bulletId: number,
        startAngle: number,
        startTime: number,
        startPosition: IPoint
    ) {
        this.containerType = containerType;
        this.bulletType = bulletType;
        this.ownerObjectId = ownerObjectId;
        this.bulletId = bulletId;
        this.startAngle = startAngle;
        this.startTime = startTime;
        this.startPosition = startPosition;
        this.containerProperties = ResourceManager.objects[containerType];
        this.projectileProperties = this.containerProperties.projectiles[bulletType];
        this.damagePlayers = this.containerProperties.enemy;
        this.damageEnemies = !this.damagePlayers;
        this.damage = 0;
    }

    public setDamage(damage: number): void {
        this.damage = damage;
    }

    public update(currentTime: number): boolean {
        const elapsed = currentTime - this.startTime;
        if (elapsed > this.projectileProperties.lifetimeMS) {
            return false;
        }
        this.currentPosition = this.getPositionAt(elapsed);
        return true;
    }

    private getPositionAt(time: number): IPoint {
        const point: IPoint = {
            x: this.startPosition.x,
            y: this.startPosition.y
        };
        let distanceTravelled = time * (this.projectileProperties.speed / 10000);
        const phase = this.bulletId % 2 === 0 ? 0 : Math.PI;
        if (this.projectileProperties.wavy) {
            const newAngle = this.startAngle + (Math.PI / 64) * Math.sin(phase + (6 * Math.PI) * time / 1000);
            point.x += distanceTravelled * Math.cos(newAngle);
            point.y += distanceTravelled * Math.sin(newAngle);
        } else if (this.projectileProperties.parametric) {
            const offset1 = time / this.projectileProperties.lifetimeMS * 2 * Math.PI;
            const offset2 = Math.sin(offset1) * (!!(this.bulletId % 2) ? 1 : -1);
            const offset3 = Math.sin(2 * offset1) * (this.bulletId % 4 < 2 ? 1 : -1);
            const angleX = Math.cos(this.startAngle);
            const angleY = Math.sin(this.startAngle);
            point.x += (offset2 * angleY - offset3 * angleX) * this.projectileProperties.magnitude;
            point.y += (offset2 * angleX - offset3 * angleY) * this.projectileProperties.magnitude;
        } else {
            if (this.projectileProperties.boomerang) {
                const halfwayPoint = this.projectileProperties.lifetimeMS * (this.projectileProperties.speed / 10000) / 2;
                if (distanceTravelled > halfwayPoint) {
                    distanceTravelled = halfwayPoint - (distanceTravelled - halfwayPoint);
                }
            }
            point.x += distanceTravelled * Math.cos(this.startAngle);
            point.y += distanceTravelled * Math.sin(this.startAngle);
            if (this.projectileProperties.amplitude !== 0) {
                const deflection =
                    this.projectileProperties.amplitude *
                    Math.sin(phase + time / this.projectileProperties.lifetimeMS * this.projectileProperties.frequency * 2 * Math.PI);
                point.x += deflection * Math.cos(this.startAngle + Math.PI / 2);
                point.y += deflection * Math.sin(this.startAngle + Math.PI / 2);
            }
        }

        return point;
    }
}
