import { refreshToken } from "@/api";

export const autoRefreshToken = async () => {
  try {
    console.log("执行到这了");

    const res = await refreshToken();
    const availableTime = res.data.availableTime;
    //@ts-expect-error
    window.refreshToken && clearTimeout(window.refreshToken);
    //@ts-expect-error
    window.refreshToken = setTimeout(
      () => {
        autoRefreshToken();
      },
      availableTime - 30 * 1000,
    );
  } catch (error) {
    console.log(error);
  }
};
