# PluginInfo
This class exports the interface which describes the `NrPlugin` decorator object structure.

### [Exported interfaces](#exported-interfaces)
 + [`IPluginInfo](#iplugininfo)

### Exported interfaces
#### `IPluginInfo`
This interface describes the plugin to the `NrPlugin` decorator.

#### `name: string`
The name of the plugin.

#### `author: string`
The author of the plugin.

#### `description: string`
> This is optional. It will default to `null`.

A description of the plugin.

#### `enabled: boolean`
> This is optional. It will default to `true`.

If this value is false, the plugin will not be run. If it is not included it will default to true.
