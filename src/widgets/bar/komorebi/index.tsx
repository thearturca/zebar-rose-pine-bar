/* @refresh reload */
import "@/index.css";
import { render } from "solid-js/web";
import { createMotion, motion } from "solid-motionone";
import { ProvidersProvider } from "@providers/index";
import { FocusedWindowTitleKomorebiWidget } from "@features/focused-window-title.komorebi.widget";
import { Group } from "@components/group.component";
import { WorkspacesKomorebiWidget } from "@features/workspaces.komorebi.widget";
import { LayoutKomorebiWidget } from "@features/layout.komorebi.widget";
import { MediaWidget } from "@features/media.widget";
import { MetricsWidget } from "@features/metrics.widget";
import { KeyboardLayoutWidget } from "@features/keyboard-layout.widget";
import { DateTimeWidget } from "@features/date-time.widget";
motion;

render(() => <App />, document.getElementById("root")!);

export function LeftGroup() {
  return (
    <Group
      animationOptions={{
        initial: {
          x: "-200%",
        },
        animate: {
          x: 0,
        },
        transition: {
          duration: 2.0,
        },
      }}
      class="justify-self-start justify-start"
    >
      <WorkspacesKomorebiWidget />
      <LayoutKomorebiWidget />
      <MediaWidget />
    </Group>
  );
}

export function CenterGroup() {
  return (
    <Group
      animationOptions={{
        initial: {
          y: "-200%",
        },
        animate: {
          y: 0,
        },
        transition: {
          duration: 2.0,
        },
      }}
      class="justify-self-center"
    >
      <FocusedWindowTitleKomorebiWidget />
    </Group>
  );
}

export function RightGroup() {
  return (
    <Group
      animationOptions={{
        initial: {
          x: "200%",
        },
        animate: {
          x: 0,
        },
        transition: {
          duration: 2.0,
        },
      }}
      class="justify-self-end justify-end"
    >
      <MetricsWidget />
      <KeyboardLayoutWidget />
      <DateTimeWidget />
    </Group>
  );
}

function App() {
  return (
    <ProvidersProvider>
      <div class="h-full grid grid-cols-3 px-[16px] items-end">
        <LeftGroup />
        <CenterGroup />
        <RightGroup />
      </div>
    </ProvidersProvider>
  );
}
