import { ThemeToggle } from "@codellyson/justui/react";
import { JustNotesLoader } from "./components/JustNotesLoader";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { UpdateBanner } from "./components/UpdateBanner";

export default function App() {
  return (
    <>
      <AuthBootstrap>
        <JustNotesLoader />
      </AuthBootstrap>
      {/* Floating bottom-right widget. Independent of auth state so the
          user can re-theme on the boot screen too. Visually overlapped
          by the Tweaks panel while it's open — acceptable since both
          are transient settings UIs. */}
      <ThemeToggle />
      {/* Tauri-only: bottom-center pill that appears when an update is
          available. No-op in the browser. */}
      <UpdateBanner />
    </>
  );
}
