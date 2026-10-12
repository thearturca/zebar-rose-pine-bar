import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  Show,
} from "solid-js";
import { MediaSession } from "zebar";
import { Motion } from "solid-motionone";
import { Presence } from "solid-motionone";
import { useProviders } from "@providers/index";
import { GroupItem } from "@components/group.component";
import { FaSolidCirclePlay, FaSolidCirclePause } from "solid-icons/fa";

const getSessionTitle = (session: MediaSession) => {
  if (session.artist) {
    return `${session.artist} - ${session.title}`;
  }

  return session.title ?? session.sessionId;
};

const SCROLL_SPEED = 50;

function calculateDistance(
  textRef: HTMLElement,
  containerRef: HTMLElement,
): number {
  const fontSize = textRef.computedStyleMap().get("font-size") as
    | CSSKeywordValue
    | undefined;
  const charSize = (Number(fontSize?.value) ?? 0) / 1.1;
  const textWidth = textRef.getBoundingClientRect().width + charSize * 2;
  const containerWidth = containerRef.getBoundingClientRect().width;
  const containersCount = textWidth / (containerWidth || 200);
  const distance = containersCount * containerWidth;

  return distance;
}

function calculateAnimation(
  textRef: HTMLElement,
  containerRef: HTMLElement,
): (string | number)[] {
  const moveTo = calculateDistance(textRef, containerRef);

  return [0, -moveTo];
}

function calculateDuration(
  textRef: HTMLElement,
  containerRef: HTMLElement,
): number {
  const travelDistance = calculateDistance(textRef, containerRef);
  const duration = travelDistance / SCROLL_SPEED;

  return duration;
}

function checkShouldScroll(
  textRef: HTMLElement,
  containerRef: HTMLElement,
): boolean {
  const textWidth = textRef.getBoundingClientRect().width;
  const containerWidth = containerRef.getBoundingClientRect().width;

  return textWidth > containerWidth;
}

export function MediaWidget() {
  const providers = useProviders();
  const [duration, setDuration] = createSignal(20);
  const [shouldScroll, setShouldScroll] = createSignal(false);
  const title = createMemo(() => {
    const session = providers.media?.currentSession;

    if (!session) {
      return undefined;
    }

    return getSessionTitle(session);
  });

  let textRef: HTMLSpanElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | null = null;

  createEffect(
    on(title, (currentTitle) => {
      if (!textRef || !containerRef || !currentTitle) {
        console.log("No textRef or containerRef or currentTitle");
        setDuration(0);
        setShouldScroll(false);
        return;
      }

      function recalculate() {
        setTimeout(() => {
          setDuration(0);
          setShouldScroll(false);
          if (textRef && containerRef) {
            setDuration(calculateDuration(textRef, containerRef));
            // setShouldScroll(checkShouldScroll(textRef, containerRef));
          }
        }, 500);
      }

      // Use requestAnimationFrame for reliable DOM measurements
      const frameId = requestAnimationFrame(() => {
        try {
          recalculate();
        } catch (e) {
          console.error("Error calculating media dimensions:", e);
          setDuration(0);
          setShouldScroll(false);
        }
      });

      if (!resizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          recalculate();
        });
      }

      resizeObserver.observe(containerRef);
      resizeObserver.observe(textRef);

      recalculate();

      onCleanup(() => {
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
      });

      return () => cancelAnimationFrame(frameId);
    }),
  );

  return (
    <Presence exitBeforeEnter initial={false}>
      <Show when={providers.media?.currentSession}>
        <GroupItem>
          <Motion.div
            class="whitespace-nowrap overflow-hidden text-left origin-left flex items-center gap-2"
            initial={{ fontSize: "0", opacity: 0, scale: 0 }}
            animate={{ fontSize: "inherit", opacity: 1, scale: 1 }}
            exit={{ fontSize: "0", opacity: 0, scale: 0 }}
            transition={{
              duration: 0.5,
              easing: [0.32, 0.72, 0, 1],
            }}
          >
            <Motion.button
              class="hover:text-rose-pine-gold text-2xl origin-left inline-flex items-center"
              initial={{ fontSize: "0", opacity: 0, scale: 0 }}
              animate={{ fontSize: "1.5rem", opacity: 1, scale: 1 }}
              exit={{ fontSize: "0", opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, easing: [0.32, 0.72, 0, 1] }}
              onClick={() => {
                providers.media?.togglePlayPause({
                  sessionId: providers.media?.currentSession?.sessionId,
                });
              }}
            >
              {providers.media?.currentSession?.isPlaying ? (
                <FaSolidCirclePause class="w-4 h-4" />
              ) : (
                <FaSolidCirclePlay class="w-4 h-4" />
              )}
            </Motion.button>
            <Presence exitBeforeEnter initial={false}>
              <Show when={title()}>
                <div
                  ref={containerRef}
                  class="overflow-clip max-w-[200px] inline-flex justify-start items-center"
                  title={title()}
                  onMouseOver={() => {
                    if (textRef && containerRef) {
                      setShouldScroll(checkShouldScroll(textRef, containerRef));
                    }
                  }}
                  onMouseLeave={() => {
                    setShouldScroll(false);
                  }}
                >
                  <span
                    class="whitespace-nowrap absolute opacity-0 pointer-events-none block w-fit"
                    ref={textRef}
                  >
                    {title()}
                  </span>
                  <Motion.span
                    initial={{
                      x: "-100%",
                    }}
                    animate={{
                      x: "0%",
                    }}
                    exit={{
                      x: "-100%",
                    }}
                    transition={{
                      easing: [0.32, 0.72, 0, 1],
                      duration: 0.25,
                    }}
                  >
                    <Motion.span
                      class="block w-fit"
                      initial={{
                        x: "100%",
                      }}
                      animate={{
                        x:
                          shouldScroll() && textRef && containerRef
                            ? calculateAnimation(textRef, containerRef)
                            : 0,
                      }}
                      transition={{
                        duration: shouldScroll() ? duration() : 0.25,
                        repeat: shouldScroll() ? Infinity : 0,
                        easing: shouldScroll() ? "linear" : [0.32, 0.72, 0, 1],
                      }}
                    >
                      <Show when={shouldScroll()} fallback={title()}>
                        {title()} | {title()}
                      </Show>
                    </Motion.span>
                  </Motion.span>
                </div>
              </Show>
            </Presence>
          </Motion.div>
        </GroupItem>
      </Show>
    </Presence>
  );
}
