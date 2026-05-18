---
layout: grid
pageSize: 20
autoLoad: true
---

```datacorejsx
const activeFile = dc.resolvePath("BASIC VIEW");
const folderPath = activeFile.substring(0, activeFile.lastIndexOf('/'));
const { View } = await dc.require(folderPath + "/src/index.jsx");
return await View({ folderPath });
```
