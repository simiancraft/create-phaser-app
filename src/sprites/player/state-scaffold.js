class State {
  constructor({ name, entity }) {
    this.name = name;
    this.entity = entity;
  }

  enter() {}

  exit() {}

  onAnimationComplete(name, animation, frame) {} //??

  onInput(command) {
    return this.name;
  }
}

class StateMachine {
  states = {};
  current = null;
  add({ name, state }) {
    if (name) {
      states[name] = state;
    }
  }

  initialState(name) {
    if (name && this.states[name]) {
      this.current = this.states[name];
      this.current.enter();
    }
  }

  onInput(command) {
    let nextState = this.current.onInput(command);

    if (nextState && nextState != this.current.name) {
      this.current.exit();
      this.current = this.states[nextState];
      this.current.enter();
    }
  }
}

//data bag ?
class Command {
  constructor(name, data) {
    this.name = name;
    for (d in data) {
      if (data.hasOwnProperty(d)) {
        this[d] = data[d];
      }
    }
  }
}
