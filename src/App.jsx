// Basic View - Application Bootstrap Core
// Version: 1.0.0

async function AppModule({ folderPath, dc }) {
  const { BasicView } = await dc.require(folderPath + "/src/BasicView.component.jsx");
  return { View: BasicView };
}

return AppModule;
