export function linearScale(domain, range, clamp) {
  if (clamp) {
    return value => {
      if (domain[0] === domain[1] || range[0] === range[1]) {
        return range[0];
      }
      let ratio = (range[1] - range[0]) / (domain[1] - domain[0]);
      let result = range[0] + ratio * (value - domain[0]);
      return Math.min(range[1], Math.max(range[0], result));
    };
  } else {
    return value => {
      if (domain[0] === domain[1] || range[0] === range[1]) {
        return range[0];
      }
      let ratio = (range[1] - range[0]) / (domain[1] - domain[0]);
      let result = range[0] + ratio * (value - domain[0]);
      return result;
    };
  }
}
