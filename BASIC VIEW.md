# BASIC VIEW

```datacorejsx
const activeFileObj = (dc.app || app).vault.getAbstractFileByPath(dc.path);
const activeFilePath = activeFileObj?.path || "";
let folderPath = activeFilePath.substring(0, activeFilePath.lastIndexOf('/'));

const AppModule = await dc.require(folderPath + "/src/App.jsx");
const { View } = await AppModule({ folderPath, dc });

return <View />;
```
