import AppRoutes from "./routes/AppRoutes";
import { SidebarProvider } from "./contexts/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <AppRoutes />
    </SidebarProvider>
  );
}

export default App;