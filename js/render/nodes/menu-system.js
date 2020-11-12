import { UrlTexture } from "../core/texture.js";
import { ButtonNode } from "./button.js";
import { Node } from "../core/node.js";

const BUTTON_INTERVAL = 0.12;

export class MenuSystem {
  constructor(highlightOverwrite = true) {
    this.buttons = [];
    this.highlightOverwrite = highlightOverwrite;
    this.menuBarNode = null;
    this.lastFrameButtonsByGamepad = new WeakMap();
  }

  createButton(path, action) {
    let button = new ButtonNode(new UrlTexture(path), () => {});
    this.buttons.push({ node: button, action: action });
  }

  getButtons() {
    return this.buttons;
  }

  getMenuBarNode() {
    this.menuBarNode = new Node();
    let numButtons = this.buttons.length;
    for (var i = 0; i < numButtons; i++) {
      let button = this.buttons[i].node;
      let buttonX = (i + (1 - numButtons) / 2) * BUTTON_INTERVAL;
      button.translation = [buttonX, -0.1, -0.1];
      button.rotation = [-0.3826834, 0, 0, 0.9238795];
      this.menuBarNode.addNode(button);
    }
    this.menuBarNode.translation = [0, -0.4, -0.2];

    return this.menuBarNode;
  }

  processInput(frame, scene, refSpace) {
    let hits = [];
    for (let source of frame.session.inputSources) {
      let gamepad = source.gamepad;
      if (gamepad) {
        let pose = frame.getPose(source.gripSpace, refSpace);
        if (gamepad.buttons[4].pressed) {
          if (pose) {
            let pos = pose.transform.position;
            let rot = pose.transform.orientation;
            this.menuBarNode.translation = [pos.x, pos.y, pos.z];
            this.menuBarNode.rotation = [rot.x, rot.y, rot.z, rot.w];
          }
        }
        let targetRayPose = frame.getPose(source.targetRaySpace, refSpace);
        if (!targetRayPose) {
          continue;
        }
        let hitResult = scene.hitTest(targetRayPose.transform);
        let lastFrameButtons = this.lastFrameButtonsByGamepad.get(gamepad);
        if (!lastFrameButtons) {
          lastFrameButtons = new Array(gamepad.buttons.length);
          lastFrameButtons.fill(false);
          this.lastFrameButtonsByGamepad.set(gamepad, lastFrameButtons);
        }
        hits.push({
          hitResult: hitResult,
          buttonPressed:
            0 < gamepad.buttons.length &&
            gamepad.buttons[0].pressed &&
            !lastFrameButtons[0],
        });
        for (let i = 0; i < gamepad.buttons.length; i++) {
          lastFrameButtons[i] = gamepad.buttons[i].pressed;
        }
      }
    }
    if (this.highlightOverwrite) {
      for (let button of this.buttons) {
        button.node.scale = [1, 1, 1];
      }
    }
    for (let hit of hits) {
      for (let button of this.buttons) {
        if (hit.hitResult && hit.hitResult.node == button.node) {
          if (this.highlightOverwrite) {
            button.node.scale = [1.2, 1.2, 1.2];
          }
          if (hit.buttonPressed) {
            button.action();
          }
          break;
        }
      }
    }
  }
}
