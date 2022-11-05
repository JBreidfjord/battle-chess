export const stringToInt = (str: string): number => {
  return str.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
}