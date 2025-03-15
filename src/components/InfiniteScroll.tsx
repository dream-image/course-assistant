import { Component, ReactNode, CSSProperties } from "react";
import { throttle } from "lodash-es";
export const ThresholdUnits = {
  Pixel: "Pixel",
  Percent: "Percent",
};

const defaultThreshold = {
  unit: ThresholdUnits.Percent,
  value: 0.8,
};

export function parseThreshold(scrollThreshold: string | number) {
  if (typeof scrollThreshold === "number") {
    return {
      unit: ThresholdUnits.Percent,
      value: scrollThreshold * 100,
    };
  }

  if (typeof scrollThreshold === "string") {
    if (scrollThreshold.match(/^(\d*(\.\d+)?)px$/)) {
      return {
        unit: ThresholdUnits.Pixel,
        value: parseFloat(scrollThreshold),
      };
    }

    if (scrollThreshold.match(/^(\d*(\.\d+)?)%$/)) {
      return {
        unit: ThresholdUnits.Percent,
        value: parseFloat(scrollThreshold),
      };
    }

    console.warn(
      'scrollThreshold format is invalid. Valid formats: "120px", "50%"...',
    );

    return defaultThreshold;
  }

  console.warn("scrollThreshold should be string or number");

  return defaultThreshold;
}
type Fn = () => any;
export interface Props {
  next: () => Promise<boolean>;
  hasMore: boolean;
  children: ReactNode;
  loader: ReactNode;
  scrollThreshold?: number | string;
  endMessage?: ReactNode;
  style?: CSSProperties;
  height?: number | string;
  scrollableTarget?: ReactNode;
  hasChildren?: boolean;
  inverse?: boolean;
  pullDownToRefresh?: boolean;
  pullDownToRefreshContent?: ReactNode;
  releaseToRefreshContent?: ReactNode;
  pullDownToRefreshThreshold?: number;
  refreshFunction?: Fn;
  onScroll?: (e: MouseEvent) => any;
  dataLength: number;
  initialScrollY?: number;
  className?: string;
}

interface State {
  showLoader: boolean;
  pullToRefreshThresholdBreached: boolean;
  prevDataLength: number | undefined;
}

export default class InfiniteScroll extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showLoader: false,
      pullToRefreshThresholdBreached: false,
      prevDataLength: props.dataLength,
    };

    this.throttledOnScrollListener = throttle(this.onScrollListener, 150).bind(
      this,
    );
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
  }
  #retryCount = 5;
  private throttledOnScrollListener: (e: MouseEvent) => void;
  private el: HTMLElement | undefined | (Window & typeof globalThis);
  private _infScroll: HTMLDivElement | undefined;
  private lastScrollTop = 0;
  private actionTriggered = false;
  private _pullDown: HTMLDivElement | undefined;

  // variables to keep track of pull down behaviour
  private startY = 0;
  private currentY = 0;
  private dragging = false;

  // will be populated in componentDidMount
  // based on the height of the pull down element
  private maxPullDownDistance = 0;
  private IntervalSearch?: number;
  componentDidMount() {
    if (typeof this.props.dataLength === "undefined") {
      throw new Error(
        `mandatory prop "dataLength" is missing. The prop is needed` +
          ` when loading more content. Check README.md for usage`,
      );
    }

    this.el = this._infScroll;

    if (this.el) {
      this.el.addEventListener(
        "scroll",
        this.throttledOnScrollListener as EventListenerOrEventListenerObject,
      );
      if (
        //@ts-ignore
        this.el.scrollHeight <= this.el.clientHeight &&
        this.props.hasMore
      ) {
        this.actionTriggered = true;
        this.setState({ showLoader: true });
        this.props.next && this.props.next();
      }
      this.IntervalSearch = setInterval(
        (() => {
          if (
            //@ts-ignore
            this.el.scrollHeight <= this.el.clientHeight &&
            this.props.hasMore
          ) {
            this.actionTriggered = true;
            this.setState({ showLoader: true });
            this.props.next &&
              this.props
                .next()
                .then((i: boolean) => {
                  if (!i) {
                    if (this.#retryCount <= 0)
                      clearInterval(this.IntervalSearch);
                    this.#retryCount--;
                  }
                })
                .catch((e) => {
                  clearInterval(this.IntervalSearch);
                });
          }
        }).bind(this),
        1000,
      );
    }

    if (
      typeof this.props.initialScrollY === "number" &&
      this.el &&
      this.el instanceof HTMLElement &&
      this.el.scrollHeight > this.props.initialScrollY
    ) {
      this.el.scrollTo(0, this.props.initialScrollY);
    }

    if (this.props.pullDownToRefresh && this.el) {
      this.el.addEventListener("touchstart", this.onStart);
      this.el.addEventListener("touchmove", this.onMove);
      this.el.addEventListener("touchend", this.onEnd);

      this.el.addEventListener("mousedown", this.onStart);
      this.el.addEventListener("mousemove", this.onMove);
      this.el.addEventListener("mouseup", this.onEnd);

      // get BCR of pullDown element to position it above
      this.maxPullDownDistance =
        (this._pullDown &&
          this._pullDown.firstChild &&
          (this._pullDown.firstChild as HTMLDivElement).getBoundingClientRect()
            .height) ||
        0;
      this.forceUpdate();

      if (typeof this.props.refreshFunction !== "function") {
        throw new Error(
          `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`,
        );
      }
    }
  }

  componentWillUnmount() {
    if (this.el) {
      this.el.removeEventListener(
        "scroll",
        this.throttledOnScrollListener as EventListenerOrEventListenerObject,
      );

      if (this.props.pullDownToRefresh) {
        this.el.removeEventListener("touchstart", this.onStart);
        this.el.removeEventListener("touchmove", this.onMove);
        this.el.removeEventListener("touchend", this.onEnd);

        this.el.removeEventListener("mousedown", this.onStart);
        this.el.removeEventListener("mousemove", this.onMove);
        this.el.removeEventListener("mouseup", this.onEnd);
      }
    }
    clearInterval(this.IntervalSearch);
  }

  componentDidUpdate(prevProps: Props) {
    // do nothing when dataLength is unchanged
    if (this.props.dataLength === prevProps.dataLength) return;

    this.actionTriggered = false;

    // update state when new data was sent in
    this.setState({
      showLoader: false,
    });
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const dataLengthChanged = nextProps.dataLength !== prevState.prevDataLength;

    // reset when data changes
    if (dataLengthChanged) {
      return {
        ...prevState,
        prevDataLength: nextProps.dataLength,
      };
    }
    return null;
  }

  onStart: EventListener = (evt: Event) => {
    if (this.lastScrollTop) return;

    this.dragging = true;

    if (evt instanceof MouseEvent) {
      this.startY = evt.pageY;
    } else if (evt instanceof TouchEvent) {
      this.startY = evt.touches[0].pageY;
    }
    this.currentY = this.startY;

    if (this._infScroll) {
      this._infScroll.style.willChange = "transform";
      this._infScroll.style.transition = `transform 0.2s cubic-bezier(0,0,0.31,1)`;
    }
  };

  onMove: EventListener = (evt: Event) => {
    if (!this.dragging) return;

    if (evt instanceof MouseEvent) {
      this.currentY = evt.pageY;
    } else if (evt instanceof TouchEvent) {
      this.currentY = evt.touches[0].pageY;
    }

    // user is scrolling down to up
    if (this.currentY < this.startY) return;

    if (
      this.currentY - this.startY >=
      Number(this.props.pullDownToRefreshThreshold)
    ) {
      this.setState({
        pullToRefreshThresholdBreached: true,
      });
    }

    // so you can drag upto 1.5 times of the maxPullDownDistance
    if (this.currentY - this.startY > this.maxPullDownDistance * 1.5) return;

    if (this._infScroll) {
      this._infScroll.style.overflow = "visible";
      this._infScroll.style.transform = `translate3d(0px, ${
        this.currentY - this.startY
      }px, 0px)`;
    }
  };

  onEnd: EventListener = () => {
    this.startY = 0;
    this.currentY = 0;

    this.dragging = false;

    if (this.state.pullToRefreshThresholdBreached) {
      this.props.refreshFunction && this.props.refreshFunction();
      this.setState({
        pullToRefreshThresholdBreached: false,
      });
    }

    requestAnimationFrame(() => {
      // this._infScroll
      if (this._infScroll) {
        this._infScroll.style.overflow = "auto";
        this._infScroll.style.transform = "none";
        this._infScroll.style.willChange = "unset";
      }
    });
  };

  isElementAtTop(target: HTMLElement, scrollThreshold: string | number = 0.8) {
    const clientHeight =
      target === document.body || target === document.documentElement
        ? window.screen.availHeight
        : target.clientHeight;

    const threshold = parseThreshold(scrollThreshold);

    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop <=
        threshold.value + clientHeight - target.scrollHeight + 1
      );
    }

    return (
      target.scrollTop <=
      threshold.value / 100 + clientHeight - target.scrollHeight + 1
    );
  }

  isElementAtBottom(
    target: HTMLElement,
    scrollThreshold: string | number = 0.95,
  ) {
    const clientHeight = target.clientHeight;

    const threshold = parseThreshold(scrollThreshold);
    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop + clientHeight >= target.scrollHeight - threshold.value
      );
    }

    return (
      target.scrollTop + clientHeight >=
      (threshold.value / 100) * target.scrollHeight
    );
  }

  onScrollListener = (event: MouseEvent) => {
    if (typeof this.props.onScroll === "function") {
      // Execute this callback in next tick so that it does not affect the
      // functionality of the library.
      setTimeout(() => this.props.onScroll && this.props.onScroll(event), 0);
    }

    const target = event.target as HTMLElement;

    // return immediately if the action has already been triggered,
    // prevents multiple triggers.
    if (this.actionTriggered) return;

    const atBottom = this.props.inverse
      ? this.isElementAtTop(target, this.props.scrollThreshold)
      : this.isElementAtBottom(target, this.props.scrollThreshold);

    // call the `next` function in the props to trigger the next data fetch
    if (atBottom && this.props.hasMore) {
      this.actionTriggered = true;
      this.setState({ showLoader: true });
      this.props.next && this.props.next();
    }

    this.lastScrollTop = target.scrollTop;
  };

  render() {
    const style = {
      height: "100%",
      overflow: "auto",
      WebkitOverflowScrolling: "touch",
      ...this.props.style,
    } as CSSProperties;
    const hasChildren =
      this.props.hasChildren ||
      !!(
        this.props.children &&
        this.props.children instanceof Array &&
        this.props.children.length
      );

    // because heighted infiniteScroll visualy breaks
    // on drag down as overflow becomes visible

    return (
      <div
        style={{
          height: "100%",
        }}
        className="infinite-scroll-component__outerdiv"
      >
        <div
          className={`infinite-scroll-component ${this.props.className || ""}`}
          ref={(infScroll: HTMLDivElement) => (this._infScroll = infScroll)}
          style={style}
        >
          {this.props.pullDownToRefresh && (
            <div
              style={{ position: "relative" }}
              ref={(pullDown: HTMLDivElement) => (this._pullDown = pullDown)}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: -1 * this.maxPullDownDistance,
                }}
              >
                {this.state.pullToRefreshThresholdBreached
                  ? this.props.releaseToRefreshContent
                  : this.props.pullDownToRefreshContent}
              </div>
            </div>
          )}
          {this.props.children}
          {!this.state.showLoader &&
            !hasChildren &&
            this.props.hasMore &&
            this.props.loader}
          {this.state.showLoader && this.props.hasMore && this.props.loader}
          {!this.props.hasMore && this.props.endMessage}
        </div>
      </div>
    );
  }
}
