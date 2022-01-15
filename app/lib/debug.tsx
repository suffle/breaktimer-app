// @eslint-disable @typescript-eslint/no-explicit-any
const customDebug = (label: string, newValue: unknown, oldValue: unknown) => {
  if (process.env.NODE_ENV === "development") {
    const headerCSS = ["color: gray; font-weight: lighter;"];

    console.group(`%c ${label}`, ...headerCSS);

    if (!oldValue) {
      console.log("%c next state", `color: blue; font-weight: bold`, newValue);
    }
    console.log("%c prev state", `color: red; font-weight: bold`, oldValue);
    console.log("%c next state", `color: blue; font-weight: bold`, newValue);
    console.groupEnd();
  }
};
export default customDebug;
