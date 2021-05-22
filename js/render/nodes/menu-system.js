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
    this.buttons.push({ node: button, action: action, state: null });
  }

  createSwitch(path1, action1, path2, action2) {
    let button1 = new ButtonNode(new UrlTexture(path1), () => {});
    let button2 = new ButtonNode(new UrlTexture(path2), () => {});
    this.buttons.push({
      node: [button1, button2],
      action: [action1, action2],
      state: 0,
    });
  }

  getButtons() {
    return this.buttons;
  }

  getButtonNode(button) {
    if (button.state != null) {
      return button.node[button.state];
    } else {
      return button.node;
    }
  }

  executeButtonAction(button) {
    if (button.state != null) {
      button.action[button.state]();
    } else {
      button.action();
    }
  }

  createMenuLayout() {
    let numButtons = this.buttons.length;
    for (var i = 0; i < numButtons; i++) {
      let buttonX = (i + (1 - numButtons) / 2) * BUTTON_INTERVAL;
      this.buttons[i]["translation"] = [buttonX, -0.1, -0.1];
      this.buttons[i]["rotation"] = [-0.3826834, 0, 0, 0.9238795];
    }
  }

  getMenuBarNode() {
    this.menuBarNode = new Node();
    this.createMenuLayout();
    for (let button of this.buttons) {
      let buttonNode = this.getButtonNode(button);
      buttonNode.translation = button.translation;
      buttonNode.rotation = button.rotation;
      this.menuBarNode.addNode(buttonNode);
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

    for (let button of this.buttons) {
      for (let hit of hits) {
        let buttonNode = this.getButtonNode(button);
        if (this.highlightOverwrite) {
          buttonNode.scale = [1, 1, 1];
        }
        if (hit.hitResult && hit.hitResult.node == buttonNode) {
          if (this.highlightOverwrite) {
            buttonNode.scale = [1.2, 1.2, 1.2];
          }
          if (hit.buttonPressed) {
            this.executeButtonAction(button);
            if (button.state != null) {
              this.menuBarNode.removeNode(buttonNode);
              button.state = 1 - button.state;
              let newButtonNode = this.getButtonNode(button);
              newButtonNode.translation = button.translation;
              newButtonNode.rotation = button.rotation;
              this.menuBarNode.addNode(newButtonNode);
            }
          }
          break;
        }
      }
    }
  }
}
