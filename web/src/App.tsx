import AppRoutes from "./routes/AppRoutes";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificacoesSistemaProvider } from "./contexts/NotificacoesSistemaContext";

function App() {
  return (
    <ToastProvider>
      <SidebarProvider>
        <NotificacoesSistemaProvider>
          <AppRoutes />
        </NotificacoesSistemaProvider>
      </SidebarProvider>
    </ToastProvider>
  );
}

export default App;