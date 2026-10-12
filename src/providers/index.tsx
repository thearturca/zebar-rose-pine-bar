import * as zebar from "zebar";
import { createStore } from "solid-js/store";
import { onCleanup, onMount, useContext } from "solid-js";
import { createContext, ParentProps } from "solid-js";

export const providers = zebar.createProviderGroup({
  cpu: { type: "cpu" },
  memory: { type: "memory" },
  weather: { type: "weather" },
  date: { type: "date", formatting: "t", locale: "ru" },
  komorebi: { type: "komorebi" },
  glazewm: { type: "glazewm" },
  keyboard: { type: "keyboard" },
  media: { type: "media" },
  tray: { type: "systray" },
});

export type Providers = Partial<typeof providers.outputMap>;

export const ProvidersContext = createContext(providers.outputMap);

export function useProviders() {
  return useContext(ProvidersContext);
}

export function ProvidersProvider(
  props: ParentProps<{ WmType?: "glazewm" | "komorebi" }>,
) {
  const [output, setOutput] = createStore(providers.outputMap);

  let wmProvider: zebar.KomorebiProvider | zebar.GlazeWmProvider | undefined;

  if (props.WmType) {
    wmProvider = zebar.createProvider({
      type: props.WmType,
    });
  }

  onMount(() => {
    providers.onOutput((outputMap) => setOutput(outputMap));
    wmProvider?.onOutput((outputMap) =>
      setOutput({
        [props.WmType!]: outputMap,
      }),
    );
  });

  onCleanup(() => {
    providers.stopAll();
    wmProvider?.stop();
  });

  return (
    <ProvidersContext.Provider value={output}>
      {props.children}
    </ProvidersContext.Provider>
  );
}
