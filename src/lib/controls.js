function makeControls(scene) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const WASDQECtrl = scene.input.keyboard.addKeys('W,A,S,D');

  const { down, left, right, up } = cursors;
  const { W, A, S, D } = WASDQECtrl;

  const buttonA = up;
  const buttonB = left;
  const select = down;
  const start = right;

  const _up = W;
  const _down = S;
  const _left = A;
  const _right = D;

  const buttons = {
    buttonA,
    buttonB
  };

  const locomotion = {
    up: _up,
    down: _down,
    left: _left,
    right: _right
  };

  const menu = { start, select };

  return { buttons, locomotion, menu };
}

export const hasNoInput = function hasNoInput({ buttons, locomotion, menu }) {
  const { buttonA, buttonB } = buttons;
  const { up, down, left, right } = locomotion;
  const { start, select } = menu;

  return (
    !buttonA.isDown &&
    !buttonB.isDown &&
    !left.isDown &&
    !right.isDown &&
    !up.isDown &&
    !down.isDown &&
    !start.isDown &&
    !select.isDown
  );
};

export default makeControls;
