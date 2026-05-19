import AppRoutes from "./routes/AppRoutes";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AppRoutes />
      </SidebarProvider>
    </ToastProvider>
  );
}

export default App;