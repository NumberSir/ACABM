/**
 * @file Auto Click and Buy Mod for Cookie Clicker.
 * @version 2.33
 * @license GPLv3-or-later https://www.gnu.org/licenses/gpl-3.0.html
 * @see {@link https://steamcommunity.com/sharedfiles/filedetails/?id=2823633161&tscn=1690261417 Steam Workshop}
 * @description This file contains the implementation of the Auto Click and Buy Mod for Cookie Clicker. The mod provides several features such as AutoClick BigCookie, AutoClick Special (Shimmers), AutoClick BigCookie during frenzy/click frenzy, AutoBuy, AutoBuy Protect, Auto Fortune, Auto Wrinklers, AutoPet Krumblor, Ascend Luck, Season, and Hotkeys. The mod also provides an options menu to customize the features. The implementation uses an Immediately Invoked Function Expression (IIFE) to avoid polluting the global namespace. The mod initializes by adding a menu to the game and overriding the UpdateMenu function. The menu is created using a dictionary that maps the feature names to their descriptions and values. The mod also defines default settings and their keys.
 */

// IIFE to avoid polluting global namespace
(function () {
  "use strict";

  // Define a constant called ACABMdefaultSettings that contains an object with default settings for the Auto click and buy mod.
  const ACABMdefaultSettings = {
    main: 0, // AutoClick
    mainspeed: 50, // AutoClick speed
    autobuy: 0, // AutoBuy
    protect: 0, // AutoBuy Protect
    gold: 0, // AutoClick Special
    frenzy: 0, // AutoClick Frenzy
    fortune: 0, // Auto Fortune
    ascendluck: 0, // Ascend Luck
    wrinklers: 0, // Auto Wrinklers
    wrinklersmax: -1, // Max amount of Wrinklers to pop automatically
    krumblor: 0, // AutoPet Krumblor
    hotkeys: 0, // Hotkeys
    upgradevault: [], // List of upgrades to buy automatically
    buildingvault: [], // List of buildings to buy automatically
    options: ["goldenAC", "wrathAC", "reindeerAC"], // Options for AutoClick Special
  };

  // Define a constant called ACABMsettingsKeys that contains an array of keys from the ACABMdefaultSettings object.
  const ACABMsettingsKeys = Object.keys(ACABMdefaultSettings);

  // Define a constant called ACABMmenuDictionary that contains an object with properties for each menu item in the Auto click and buy mod.
  const ACABMmenuDictionary = {
    main: {
      name: "自动点击",
      description: "自动点击大饼干， 1000毫秒 = 1秒。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    autobuy: {
      name: "自动购买",
      description:
          '自动购买“最佳CpS”的建筑、升级。',
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    gold: {
      name: "自动点击/特殊",
      description: "自动点击黄金饼干、驯鹿饼干、愤怒饼干。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    frenzy: {
      name: "自动点击/狂热",
      description:
          '在狂热期间自动点击大饼干。如果已经启用“自动点击”就不用再启用这个了。',
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    wrinklers: {
      name: "自动点击/饼干虫",
      description:
          "在数量超过设定上限后自动戳破饼干虫。默认达到最大上限后才会开始戳破，闪光饼干虫不算在内。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    ascendluck: {
      name: "幸运飞升",
      description:
          "用于解锁 Lucky digit, Lucky number，与 Lucky payout 成就。会在你满足条件时自动飞升，并在这次触发后关闭此功能。下次如果你还想使用请手动启用。注意本功能并不会自动为你购买天堂升级。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    protect: {
      name: "自动购买保护",
      description:
          "会自动判断狂热和幸运效果的满足条件，以确保自动购买不会出现问题。如果自动购买功能确实出了问题，请关闭此功能。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    fortune: {
      name: "自动点击/幸运",
      description: "自动点击新的幸运纸条。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    hotkeys: {
      name: "快捷键",
      description:
          "让你可以通过快捷键的方式操作本模组。部分新功能没有对应的快捷键。",
      values: {
        0: "禁用",
        1: "启用",
      },
    },
    krumblor: {
      name: "自动抚养饼干龙",
      description:
          '在达到等级 4 之后自动抚养饼干龙。注意仅在饼干龙的菜单开启，且已经解锁天堂升级“养龙”时才会生效。如果你尚未拥有全部 4 种掉落物，或是尚未满足条件，请不要启用本功能。',
      values: {
        0: "禁用",
        1: "启用",
      },
    },
  };

  /**
   * This object contains the main logic for the Auto click and buy mod.
   * @type {Object}
   * @property {Function} init - Initializes the mod by adding a menu and notifying the user.
   */
  const ACABM = {
    init: function () {
      // Define a constant called ACABM and set its value to the current object.
      const ACABM = this;

      // Destructure the UpdateMenu function from the Game object.
      const { UpdateMenu } = Game;

      // Redefine the Game.UpdateMenu function as an arrow function that calls the original UpdateMenu function and then calls the addMenu method of the ACABM object.
      Game.UpdateMenu = () => {
        UpdateMenu();
        ACABM.addMenu();
      };

      // Destructure the Notify function from the Game object.
      const { Notify } = Game;

      // Call the Notify function with four arguments to set up a notification that informs the user that the Auto click and buy mod has been loaded and provides instructions for turning the mod on and off in the Options menu.
      Notify(
          "自动点击与购买模组已加载！",
          '请在<b><a href="#" onclick=Game.ShowMenu("prefs");>选项</a></b>菜单中启用/禁用相关功能。',
          [30, 6],
          20
      );

      /**
       * Calculator class for calculating the best item to buy based on the current game state.
       *
       * @class
       */
      class Calculator {
        /**
         * Creates an instance of Calculator.
         * @memberof Calculator
         */
        constructor() {
          /**
           * Schema for the Calculator class.
           * @type {Array}
           * @property {Function} objects - Returns an array of objects to be used in the schema.
           * @property {Object} accessors - Accessors for the objects in the schema.
           * @property {Function} accessors.add - Adds an object to the schema.
           * @property {Function} accessors.sub - Removes an object from the schema.
           * @property {Function} accessors.price - Returns the price of an object.
           * @property {Function} accessors.lasting - Returns the lasting value of an object.
           */
          this.schema = [
            {
              objects: function() {
                return Game.UpgradesInStore.filter(function(e) {
                  return (
                      [].indexOf(e.id) < 0 &&
                      e.pool != "prestige" &&
                      e.pool != "toggle" &&
                      !Game.vault.includes(e.id) &&
                      !ACABM.settings.upgradevault.includes(e.id)
                  );
                });
              },
              accessors: {
                add: function(e) {
                  e.bought = 1;
                },
                sub: function(e) {
                  e.bought = 0;
                },
                price: function(e) {
                  return e.basePrice;
                },
                lasting: function(e) {
                  return e.lasting;
                }
              }
            },
            {
              objects: function() {
                return Game.ObjectsById.filter(function(e) {
                  return [].indexOf(e.id) < 0 &&
                      !ACABM.settings.buildingvault.includes(e.id);
                });
              },
              accessors: {
                add: function(e) {
                  e.amount++;
                },
                sub: function(e) {
                  e.amount--;
                },
                price: function(e) {
                  return e.price;
                },
                lasting: function(e) {
                  return e.lasting;
                }
              }
            },
          ];
        }

        /**
         * Calculates the cps_acc value.
         * @memberof Calculator
         * @param {number} base_cps - The base cps value.
         * @param {number} new_cps - The new cps value.
         * @param {number} price - The price of the object.
         * @returns {number} The cps_acc value.
         */
        cps_acc(base_cps, new_cps, price) {
          return (base_cps * base_cps * (new_cps - base_cps)) / (price * price);
        }

        /**
         * Calculates the ecps value.
         * @memberof Calculator
         * @returns {number} The ecps value.
         */
        ecps() {
          return Game.cookiesPs * (1 - Game.cpsSucked);
        }

        /**
         * Calculates the bonus value.
         * @memberof Calculator
         * @param {Object} item - The item to calculate the bonus for.
         * @param {Function} list_generator - The list generator function.
         * @param {number} mouse_rate - The mouse rate value.
         * @returns {Array} The bonus value.
         */
        calc_bonus(item, list_generator, mouse_rate) {
          var func = Game.Win;
          Game.Win = function () {};

          var res = list_generator().map(
              function (e) {
                var lasting = this.item.lasting(e);
                var price = Math.round(this.item.price(e));
                // -- Garden Upgrade Calc -- currently the only upgrades using lasting.
                if (lasting) {
                  price = Math.round(price * Game.cookiesPs * 60);
                }
                // -- Dragon Upgrade Calc -- currently the only upgrades with price 999.
                if (price == 999) {
                  price =
                      Game.unbuffedCps *
                      60 *
                      30 *
                      (Game.dragonLevel < Game.dragonLevels.length - 1 ? 1 : 0.1);
                }

                this.item.add(e);
                Game.CalculateGains();
                var cps = this.calc.ecps() + Game.computedMouseCps * this.rate;
                this.item.sub(e);
                Game.CalculateGains();
                return {
                  obj: e,
                  price: price,
                  acc: this.calc.cps_acc(this.base_cps, cps, price),
                };
              }.bind({
                item: item,
                calc: this,
                rate: mouse_rate,
                base_cps:
                    (Game.cookiesPs ? this.ecps() : 0.001) +
                    Game.computedMouseCps * mouse_rate,
              })
          );

          Game.Win = func;
          return res;
        }

        /**
         * Finds the best value.
         * @memberof Calculator
         * @param {number} mouse_rate - The mouse rate value.
         * @returns {Object} The best value.
         */
        find_best(mouse_rate) {
          var pool = [];
          var zero_buy = Math.sqrt(Game.cookiesEarned * Game.cookiesPs);
          for (var i = 0; i < this.schema.length; i++)
            pool = pool.concat(
                this.calc_bonus(
                    this.schema[i].accessors,
                    this.schema[i].objects,
                    mouse_rate || 0
                )
            );

          return pool.reduce(function (m, v) {
            return m.acc == 0 && m.price < zero_buy
                ? m
                : v.acc == 0 && v.price < zero_buy
                    ? v
                    : m.acc < v.acc
                        ? v
                        : m;
          }, pool[0]);
        }
      }

      /**
       * The main class for the autoclickandbuyMod.
       * @class
       * @constructor
       * @property {Calculator} calc - An instance of the Calculator class.
       * @property {boolean} protect - A boolean indicating whether the player's purchases should be protected.
       * @property {Object} target - An object containing the name and price of the target purchase.
       * @property {number} total - The total number of buildings and upgrades owned by the player.
       * @property {Object} actions - An object containing the various actions that can be performed by the mod.
       * @property {Object} actions.timeouts - An object containing the timeouts for each action.
       * @property {Object} actions.togglesettings - An object containing the delay and function for toggling the mod's settings.
       * @property {Object} actions.guard - An object containing the delay and function for updating the player's total number of buildings and upgrades.
       * @property {Object} actions.autobuy - An object containing the delay and function for automatically buying the target purchase.
       * @property {Object} actions.status - An object containing the delay and function for displaying the mod's status.
       * @property {Object} actions.protect - An object containing the delay and function for toggling the protection of the player's purchases.
       * @property {Object} actions.main - An object containing the delay and function for clicking the cookie.
       * @property {Object} actions.krumblor - An object containing the delay and function for activating Krumblor.
       * @property {Object} actions.frenzy - An object containing the delay and function for clicking the cookie during a frenzy.
       * @property {Object} actions.gold - An object containing the delay and function for clicking the golden cookie.
       * @property {Object} actions.ascendluck - An object containing the delay and function for clicking the cookie during an ascension.
       * @property {Object} actions.fortune - An object containing the delay and function for clicking the fortune cookie.
       * @property {Object} actions.wrinklers - An object containing the delay and function for popping wrinklers.
       */
      class Controller {
        constructor() {
          this.calc = new Calculator();
          this.protect = false;
          this.target = {
            name: undefined,
            price: -1,
          };
          this.total = -1;
          this.actions = {
            timeouts: {},
            togglesettings: {
              delay: 50,
              func: this.toggle_settings.bind(this),
            },
            guard: {
              delay: 100,
              func: this.guard.bind(this),
            },
            autobuy: {
              delay: 200,
              func: this.autobuy.bind(this),
            },
            status: {
              delay: 0,
              func: this.status.bind(this),
            },
            protect: {
              delay: 0,
              func: this.toggle_protect.bind(this),
            },
            main: {
              delay: ACABM.settings.mainspeed,
              func: function () {
                Game.ClickCookie(0);
              },
            },
            krumblor: {
              delay: 200,
              func: this.krumblor.bind(this),
            },
            frenzy: {
              delay: 50,
              func: function () {
                if (Game.buffs["Click Frenzy"] || Game.buffs["Frenzy"]) {
                  Game.ClickCookie(0);
                }
              },
            },
            gold: {
              delay: 250,
              func: this.gold.bind(this),
            },
            ascendluck: {
              delay: 50,
              func: this.ascendluck.bind(this),
            },
            fortune: {
              delay: 2000,
              func: this.fortune.bind(this),
            },
            wrinklers: {
              delay: 2000,
              func: this.wrinklers.bind(this),
            },
          };
          this.toggle_action("guard");
          this.toggle_action("togglesettings");
        }

        say(msg) {
          //I don't think anyone uses console log to reach this stuff anymore.
          //console.log(msg);
          if (ACABM.settings["hotkeys"]) {
            Game.Popup(msg, Game.windowW / 2, Game.windowH - 100);
          }
        }

        /**
         * The guard function updates the total number of buildings and upgrades owned by the player,
         * and checks whether the autobuy action should be unqueued.
         * @function
         * @name guard
         */
        guard() {
          var t = this.total;
          this.total =
              1000 * (Game.hasBuff("Frenzy") != 0 ? 1 : 0) +
              Game.BuildingsOwned +
              Game.UpgradesOwned;
          if (
              this.actions.timeouts.buy &&
              (t != this.total ||
                  !this.actions.autobuy.id ||
                  this.target.price <= Game.cookies - this.calc.ecps())
          )
            this.unqueue_action("buy");
        }

        /**
         * The `autobuy` function is responsible for automatically buying the best building or upgrade based on the current game state.
         * @function
         * @returns {void}
         */
        autobuy() {
          if (this.actions.timeouts.buy) {
            ACABM.abmessage["buy"] =
                "正在等待 (" +
                Beautify(
                    (this.target.price - Game.cookies) / this.calc.ecps(),
                    1
                ) +
                "s) 以购买 " +
                this.target.dname;
            return;
          }
          var info = this.calc.find_best(
              this.actions.main.id ? 1000 / this.actions.main.delay : 0
          );

          var protect =
              this.protect && Game.Has("Get lucky") != 0
                  ? (Game.hasBuff("Frenzy") != 0 ? 1 : 7) * Game.cookiesPs * 1200
                  : 0;
          var wait = (protect + info.price - Game.cookies) / this.calc.ecps();
          if (!isFinite(wait) || wait > 120) {
            ACABM.abmessage["buy"] =
                '自动购买想要购买："' +
                info.obj.dname +
                '" 但需要等待一段时间：(' +
                Beautify(wait, 1) +
                "s)";
            return;
          }

          var msg =
              (wait > 0 ? "等待 (" + Beautify(wait, 1) + "s) 以购买" : "正在购买") +
              ' "' +
              info.obj.dname +
              '"';
          ACABM.abmessage["buy"] = msg;
          //console.log("For {cps = " + Beautify(Game.cookiesPs, 1) + ", protect = " + Beautify(protect) + "} best candidate is", info);
          this.say(msg);
          if (wait > 0) {
            this.target.name = info.obj.name;
            this.target.price = protect + info.price;
            this.queue_action(
                "buy",
                1000 * (Game.cookiesPs ? wait + 0.05 : 60),
                function () {
                  if (info.price <= Game.cookies) {
                    this.say('正在购买 "' + info.obj.dname + '"');
                    if (info.obj.name === "One mind") {
                      Game.UpgradesById["69"].buy(1);
                      Game.ClosePrompt();
                      this.total++;
                      this.unqueue_action("buy");
                    } else {
                      info.obj.buy();
                      this.total++;
                    }
                  }
                }.bind(this)
            );
          } else {
            if (info.obj.name === "One mind") {
              Game.UpgradesById["69"].buy(1);
              Game.ClosePrompt();
              this.total++;
            } else {
              info.obj.buy();
              this.total++;
            }
          }
        }

        /**
         * The `status` function is responsible for displaying the current status of the autoclick and buy mod, including the current keyboard hotkeys, the status of each action, the cookie protection status, the main auto click speed, and the estimated time remaining for the next purchase.
         * @function
         * @returns {void}
         */
        status() {
          var act = [];
          var b2s = function (b) {
            return b ? "on".fontcolor("green") : "off".fontcolor("red");
          };

          for (var i in this.actions) {
            if (this.actions[i].delay && i != "guard") {
              // add [ before and ] after first character of the action name. autobuy = [A]utobuy
              // not all first chracters for the option match the hotkey, so adding manually.
              switch (i) {
                case "ascendluck":
                  var sname = "[Z]" + i;
                  break;
                case "fortune":
                  var sname = "[N]" + i;
                  break;
                default:
                  var sname =
                      i.slice(0, 0) +
                      "[" +
                      i.slice(0, 1).toUpperCase() +
                      "]" +
                      i.slice(1);
              }
              act.push(sname + ": " + b2s(this.actions[i].id));
            }
          }
          var msg = "<p>[S]状态</p><p>键盘快捷键有： []</p>";
          msg += "<p>" + act.join(", ") + "</p>";
          msg +=
              "<p>[P]保护 - 确保在狂热/幸运状态下点击大饼干：" +
              b2s(this.protect) +
              "</p>";
          msg +=
              "<p>[M]自动点击鼠标速度" +
              this.actions["main"].delay +
              "ms</p>";
          msg +=
              "<p>请使用 shift + 1 提升数值，请使用 shift + 2 减小数值</p>";

          if (this.actions.timeouts.buy) {
            msg +=
                "<p>等待 " +
                Beautify(
                    (this.target.price - Game.cookies) / this.calc.ecps(),
                    1
                ) +
                ' 秒以购买 "' +
                this.target.dname +
                '"</p>';
          }
          this.say(msg);
        }

        /**
         * The `ascendluck` function is responsible for checking if the player has unlocked the necessary Heavenly Upgrades to ascend with Lucky digit, Lucky number, and Lucky payout. If the player has not unlocked these upgrades, the function will display a message indicating which upgrades are required. If the player has unlocked all upgrades, the function will turn off the `ascendluck` action. If the player has unlocked some but not all upgrades, the function will wait for the player to reach the required prestige level before ascending.
         * @function
         * @returns {void}
         */
        ascendluck() {
          // Access this within nested function.
          var thisfunc = this;

          function doascendluckOff() {
            ACABM.settings["ascendluck"] = 0;
            thisfunc.toggle_action("ascendluck", true);
            Game.UpdateMenu();
          }

          function doascendLuck() {
            if (Game.ascensionMode !== 0) return;
            Game.Ascend(1);
            Game.ClosePrompt();
            ACABM.settings["ascendluck"] = 0;
            thisfunc.toggle_action("ascendluck", true);
          }

          if (
              Game.HasUnlocked("Lucky digit") &&
              Game.HasUnlocked("Lucky number") &&
              Game.HasUnlocked("Lucky payout")
          ) {
            ACABM.abmessage["ALmsg"] =
                "你已经解锁了以下所有“幸运”相关的天堂升级：Lucky digit, Lucky number, 和 Lucky payout。";
            doascendluckOff();
            return;
          }

          if (Game.HasUnlocked("Heavenly luck")) {
            if (
                !Game.HasUnlocked("Lucky digit") &&
                Game.HasUnlocked("Heavenly luck")
            ) {
              if (
                  (Game.prestige + Game.ascendMeterLevel).toString().split("7")
                      .length -
                  1 >=
                  1
              ) {
                doascendLuck();
              } else {
                ACABM.abmessage["ALmsg"] =
                    "正在等待威望等级包含一个 7";
              }
            } else if (!Game.HasUnlocked("Lucky number")) {
              if (
                  Game.HasUnlocked("Lucky digit") &&
                  Game.HasUnlocked("Lasting fortune")
              ) {
                if (
                    (Game.prestige + Game.ascendMeterLevel).toString().split("7")
                        .length -
                    1 >=
                    2
                ) {
                  doascendLuck();
                } else {
                  ACABM.abmessage["ALmsg"] =
                      "正在等待威望等级包含两个 7";
                }
              } else {
                ACABM.abmessage["ALmsg"] =
                    "你需要以下天堂升级：" +
                    (Game.HasUnlocked("Lucky digit") ? "" : '"Lucky digit"') +
                    " " +
                    (Game.HasUnlocked("Lucky digit") +
                    Game.HasUnlocked("Lasting fortune") >
                    0
                        ? ""
                        : " 和 ") +
                    "  " +
                    (Game.HasUnlocked("Lasting fortune")
                        ? ""
                        : '"Lasting fortune"') +
                    " to use this feature.";
                doascendluckOff();
              }
            } else if (!Game.HasUnlocked("Lucky payout")) {
              if (
                  Game.HasUnlocked("Lucky number") &&
                  Game.HasUnlocked("Decisive fate")
              ) {
                if (
                    (Game.prestige + Game.ascendMeterLevel).toString().split("7")
                        .length -
                    1 >=
                    4
                ) {
                  doascendLuck();
                } else {
                  ACABM.abmessage["ALmsg"] =
                      "正在等待威望等级包含四个 7";
                }
              } else {
                ACABM.abmessage["ALmsg"] =
                    "你尚未拥有以下所需的天堂升级：" +
                    (Game.HasUnlocked("Lucky number") ? "" : '"Lucky number"') +
                    " " +
                    (Game.HasUnlocked("Lucky number") +
                    Game.HasUnlocked("Decisive fate") >
                    0
                        ? ""
                        : " 和 ") +
                    "  " +
                    (Game.HasUnlocked("Decisive fate") ? "" : '"Decisive fate"') +
                    "，所以暂无法使用本功能。";
                doascendluckOff();
              }
            }
          } else {
            ACABM.abmessage["ALmsg"] =
                '你尚未拥有以下所需的天堂升级："Heavenly luck"，所以暂无法使用本功能。';
            doascendluckOff();
          }
        }

        /**
         * The `fortune` function checks if the current ticker effect is a "fortune" effect and clicks the ticker if it is.
         * @function
         * @returns {void}
         */
        fortune() {
          if (Game.TickerEffect && Game.TickerEffect.type === "fortune") {
            Game.tickerL.click();
          }
        }

        /**
         * The `wrinklers` function is responsible for popping the most valuable wrinklers when the maximum number of wrinklers is reached. It pops the most valuable normal wrinkler first, and if there are no normal wrinklers available, it pops the most valuable shiny wrinkler if enabled.
         * @function
         * @returns {void}
         */
        wrinklers() {
          // Pop fattest normal wrinkler when you reach max wrinklers.
          if (Game.elderWrath > 0) {
            let wrinklersM;
            let wrinklersNormal = Game.wrinklers.filter(function (e) {
              return e.type == 0 && e.sucked > 0;
            });
            let wrinklersShiny = Game.wrinklers.filter(function (e) {
              return e.type !== 0 && e.sucked > 0;
            });

            // Set max wrinklers to Game.getWrinklersMax if not set.
            if (ACABM.settings.wrinklersmax == -1) {
              ACABM.settings.wrinklersmax = Game.getWrinklersMax() - 1;
            }

            wrinklersM = ACABM.settings.wrinklersmax;

            // Is current amount of wrinklers at max?
            if (
                Object.keys(wrinklersNormal).length +
                Object.keys(wrinklersShiny).length >
                wrinklersM ||
                Object.keys(wrinklersNormal).length +
                Object.keys(wrinklersShiny).length >=
                Game.getWrinklersMax()
            ) {
              /*console.log(
              "Wrinklers Normal: " +
                Object.keys(wrinklersNormal).length +
                " Wrinklers Shiny: " +
                Object.keys(wrinklersShiny).length +
                " Wrinkler Max: " +
                wrinklersM
            );*/

              // Pop Normal Wrinkler
              if (Object.keys(wrinklersNormal).length > 0) {
                Game.wrinklers[
                    wrinklersNormal.reduce((m, v) =>
                        m.sucked > v.sucked ? m : v
                    ).id
                    ].hp = 0;
                this.say("戳破收益最高的普通饼干虫");
              }
              // Pop Shiny if enabled and no Normal Wrinklers available.
              if (
                  Object.keys(wrinklersShiny).length > 0 &&
                  ACABM.settings.options.indexOf("popSW") != -1 &&
                  Object.keys(wrinklersNormal).length == 0
              ) {
                Game.wrinklers[
                    wrinklersShiny.reduce((m, v) =>
                        m.sucked > v.sucked ? m : v
                    ).id
                    ].hp = 0;
                this.say("戳破收益最高的闪光饼干虫");
              }
            }
          }
        }

        /**
         * The `krumblor` function is responsible for handling the logic related to Krumblor, the dragon in Cookie Clicker. It checks if the player has unlocked all Krumblor upgrades, if the Krumblor menu is open and the player has the Heavenly Upgrade "Pet the dragon", and turns off the Krumblor option if the player does not meet the requirements to pet Krumblor.
         * @function
         * @returns {void}
         */
        krumblor() {
          const unlockMsg = [];
          const offReasons = [];

          const hasUnlockedScale = Game.HasUnlocked("Dragon scale");
          const hasUnlockedClaw = Game.HasUnlocked("Dragon claw");
          const hasUnlockedFang = Game.HasUnlocked("Dragon fang");
          const hasUnlockedTeddy = Game.HasUnlocked("Dragon teddy bear");
          const hasPetDragon = Game.HasUnlocked("Pet the dragon");
          const dragonLevel = Game.dragonLevel;
          const isKrumblorMenuOpen = Game.specialTab === "dragon";

          // If all 4 Krumblor drops are unlocked, turn off.
          if (
              hasUnlockedScale &&
              hasUnlockedClaw &&
              hasUnlockedFang &&
              hasUnlockedTeddy
          ) {
            ACABM.settings["krumblor"] = 0;
            unlockMsg.push(
                "你已经解锁了所有“饼干龙”相关升级：Dragon scale, Dragon claw, Dragon fang, 和 Dragon teddy bear。"
            );
          } else {
            // If Krumblor menu is open, Dragon level is 4 or higher, and you own the Heavenly Upgrade "Pet the dragon", pet Krumblor.
            if (isKrumblorMenuOpen && dragonLevel >= 4 && hasPetDragon) {
              unlockMsg.push("抚养饼干龙，以解锁以下升级：");
              if (!hasUnlockedScale) unlockMsg.push("Dragon scale");
              if (!hasUnlockedClaw) unlockMsg.push("Dragon claw");
              if (!hasUnlockedFang) unlockMsg.push("Dragon fang");
              if (!hasUnlockedTeddy) unlockMsg.push("Dragon teddy bear");

              Game.ClickSpecialPic();
            } else {
              // If Krumblor menu is not open, Dragon level is under 4, or you do not own the Heavenly Upgrade "Pet the dragon", turn off.
              ACABM.settings["krumblor"] = 0;

              if (!hasPetDragon) {
                offReasons.push(
                    '你尚未拥有以下所需的天堂升级："Pet the dragon".'
                );
              } else {
                if (!isKrumblorMenuOpen)
                  offReasons.push("饼干龙菜单尚未展开。");

                if (dragonLevel < 4)
                  offReasons.push("饼干龙等级尚未达到 4。");
              }

              unlockMsg.push(
                  "你尚未满足以下抚养饼干龙的所需条件：",
                  ...offReasons,
                  "请在满足条件后再启用本功能。"
              );
            }
          }

          ACABM.abmessage["AKmsg"] = unlockMsg.join("<br>");
          Game.UpdateMenu();
        }

        /**
         * The `gold` function checks if there are any golden cookies or reindeer on the screen and clicks them if the corresponding options are enabled.
         * @function
         * @returns {void}
         */
        gold() {
          if (Game.shimmers) {
            Game.shimmers.forEach((shimmer) => {
              if (shimmer && shimmer.type === "golden") {
                if (
                    !shimmer.wrath &&
                    ACABM.settings.options.indexOf("goldenAC") !== -1
                ) {
                  shimmer.pop();
                } else if (
                    shimmer.wrath &&
                    ACABM.settings.options.indexOf("wrathAC") !== -1
                ) {
                  if (
                      shimmer.forceObj["wrath"] &&
                      ACABM.settings.options.indexOf("wrathACS") !== -1
                  ) {
                    return;
                  } else {
                    shimmer.pop();
                  }
                }
              } else if (
                  shimmer &&
                  shimmer.type === "reindeer" &&
                  ACABM.settings.options.indexOf("reindeerAC") !== -1
              ) {
                shimmer.pop();
              }
            });
          }
        }

        /**
         * Toggles the protection mode of the autoclickandbuyMod.
         * Used for the "Protect" option.
         * @function
         * @returns {void}
         */
        toggle_protect() {
          if (ACABM.settings["protect"] === 0) {
            this.protect = false;
            this.unqueue_action("buy");
          } else {
            this.protect = true;
          }
        }

        /**
         * The `toggle_action` function toggles the specified action based on the loading status and the corresponding settings.
         * @function
         * @param {string} name - The name of the action to toggle.
         * @param {boolean} loading - The loading status of the action.
         * @returns {void}
         */
        toggle_action(name, loading) {
          var action = this.actions[name];
          var loading = loading;

          if (!action) return;

          if (name == "guard" || (name == "togglesettings" && !loading)) {
            setInterval(action.func, action.delay);
          }

          if (name == "status") {
            action.func();
          }

          if (loading && name == "protect") {
            action.func();
            //console.log("Protect " + this.protect);
          }

          if (
              loading &&
              ACABM.settings[name] === 0 &&
              action.id &&
              name !== "protect"
          ) {
            //console.log("clearInterval" + name);
            action.id = clearInterval(action.id);
          } else if (
              loading &&
              ACABM.settings[name] === 1 &&
              !action.id &&
              name !== "protect"
          ) {
            //console.log("setInterval " + name);
            action.id = setInterval(action.func, action.delay);
          }
        }

        /**
         * The `toggle_settings` function handles the toggling of settings for the autoclickandbuyMod.
         * @function
         * @returns {void}
         */
        toggle_settings() {
          // Handle mainspeed
          if (
              ACABM.settings["mainspeed"] &&
              typeof ACABM.settings["mainspeed"] === "number" &&
              this.actions.main.delay !== ACABM.settings["mainspeed"]
          ) {
            var action = this.actions["main"];
            if (!action) return;
            action.id = clearInterval(action.id);
            this.actions.main.delay = ACABM.settings["mainspeed"];
            action.id = setInterval(action.func, action.delay);
          }

          // Handle toggle settings
          const skipToggle = ["hotkeys"];
          for (var i in ACABM.settings) {
            if (!skipToggle.includes(i)) {
              this.toggle_action(i, true);
            }
          }
        }

        /**
         * The `delay_speed` function adjusts the delay of the specified action based on the given speed action.
         * @function
         * @param {string} name - The name of the action to adjust the delay for.
         * @param {string} speedaction - The speed action to perform. Can be either "add" or "sub".
         * @returns {void}
         */
        delay_speed(name, speedaction) {
          var action = this.actions[name];
          if (!action) return;

          // simple variable to change the this.say message.
          var actmsg = true;
          if (speedaction == "add") {
            action.id = clearInterval(action.id);
            action.delay += 50;
            ACABM.settings.mainspeed = action.delay;
            action.id = setInterval(action.func, action.delay);
          }

          if (speedaction == "sub") {
            // don't go under 50ms
            if (action.delay >= 100) {
              action.id = clearInterval(action.id);
              action.delay -= 50;
              ACABM.settings.mainspeed = action.delay;
              action.id = setInterval(action.func, action.delay);
            } else {
              actmsg = false;
            }
          }

          this.say(
              "当前行为：" +
              name +
              (actmsg
                  ? "现在延迟为 " + this.actions[name].delay + "ms"
                  : "延迟无法设置到 50ms 以下")
          );
          Game.UpdateMenu();
        }

        /**
         * The `unqueue_action` function removes a queued action by name from the `timeouts` object and clears its timeout.
         * @function
         * @param {string} name - The name of the action to remove from the `timeouts` object.
         * @returns {void}
         */
        unqueue_action(name) {
          var to = this.actions.timeouts;
          if (to[name]) {
            clearTimeout(to[name]);
            delete to[name];
          }
        }

        /**
         * The `queue_action` function queues an action to be executed after a specified delay.
         * @function
         * @param {string} name - The name of the action to queue.
         * @param {number} delay - The delay (in milliseconds) before the action is executed.
         * @param {function} func - The function to execute when the delay has elapsed.
         * @returns {void}
         */
        queue_action(name, delay, func) {
          var to = this.actions.timeouts;
          this.unqueue_action(name);
          to[name] = setTimeout(function () {
            func();
            delete to[name];
          }, delay);
        }
      }

      /**
       * Object representing the view of the autoclickandbuyMod.
       * @typedef {Object} View
       * @property {Controller} ctrl - The controller for the view.
       * @property {Object.<string, string>} actions - The key-value pairs of keyboard shortcuts and their corresponding actions.
       */
      const view = {
        ctrl: new Controller(),
        actions: {
          KeyA: "autobuy",
          KeyZ: "ascendluck",
          KeyG: "gold",
          KeyF: "frenzy",
          KeyM: "main",
          KeyN: "fortune",
          KeyS: "status",
          KeyP: "protect",
          KeyW: "wrinklers",
        },
      };

      /**
       * Event listener for the `keydown` event.
       * @listens keydown
       * @param {Event} e - The event object.
       * @returns {void}
       */
      document.addEventListener("keydown", (e) => {
        if (ACABM.settings.hotkeys) {
          const action = view.actions[e.code];
          if (action) {
            if (e.code === "KeyS") {
              view.ctrl.toggle_action(action);
              return;
            }
            const value = ACABM.settings[action];
            const { values } = ACABMmenuDictionary[action];
            const newValue = (value + 1) % Object.entries(values).length;
            ACABM.settings[action] = newValue;
            Game.UpdateMenu();
          }
          if (e.shiftKey) {
            if (e.which == 49) {
              view.ctrl.delay_speed("main", "add");
            }
            if (e.which == 50) {
              view.ctrl.delay_speed("main", "sub");
            }
          }
        }
      });
    },
    /**
     * Loads the settings from a string.
     * @param {*} str
     * @returns {void}
     */
    load: function (str) {
      if (str && str.length > 0) {
        const saveData = JSON.parse(str);
        ACABMsettingsKeys.forEach((key) => {
          this.settings[key] = Array.isArray(saveData[key])
              ? [...saveData[key]]
              : +saveData[key] || 0;
        });
      }
    },
    /**
     * Saves the settings to a string.
     * @returns {string} The settings string.
     */
    save: function () {
      const saveData = {};
      ACABMsettingsKeys.forEach((key) => {
        saveData[key] = Array.isArray(this.settings[key])
            ? [...this.settings[key]]
            : this.settings[key];
      });
      return JSON.stringify(saveData);
    },
    /**
     * Resets the settings to their default values.
     */
    settings: ACABMdefaultSettings,
    /**
     * AutoBuy status message.
     * @type {string}
     * @memberof ACABM
     */
    abmessage: {},
    /**
     * Adds the mod's menu to the game's preferences menu.
     * Only adds the menu if the current menu is the preferences menu.
     * @memberof ACABM
     */
    addMenu() {
      if (Game.onMenu === "prefs") {
        const newBlock = this.createMenu();
        const menu = document.getElementById("menu");
        const titleSection = menu.querySelector(".section");
        menu.insertBefore(
            newBlock,
            titleSection.nextSibling.nextSibling.nextSibling
        );
      }
    },
    /**
     * Creates the mod's menu in the game's preferences menu.
     * @returns {HTMLDivElement} The created menu block.
     * @memberof ACABM
     */
    createMenu() {
      const block = document.createElement("div");
      block.className = "block";
      block.style.padding = "0px";
      block.style.margin = "8px 4px";

      const subsection = document.createElement("div");
      subsection.className = "subsection";
      subsection.style.padding = "0px";
      block.appendChild(subsection);

      const title = document.createElement("div");
      title.className = "title";
      title.textContent = "自动点击与购买模组";
      subsection.appendChild(title);

      const skipSetting = [
        "mainspeed",
        "wrinklersmax",
        "upgradevault",
        "buildingvault",
        "options",
      ];

      for (const key of ACABMsettingsKeys) {
        if (!skipSetting.includes(key)) {
          const listing = this.createMenuListing(key);
          subsection.appendChild(listing);
        }
      }

      return block;
    },
    /**
     * Creates a menu listing for the mod's menu in the game's preferences menu.
     * @param {string} id - The ID of the menu listing to create.
     * @memberof ACABM
     */
    createMenuListing(id) {
      const ACABM = this;
      const { settings } = ACABM;
      const { name, description, values } = ACABMmenuDictionary[id];
      /**
       * Static Upgrade IDs need to move this to the settings options.
       * Add a comma separated list of upgrade IDs to UUPids array.
       * @type {Array}
       */
      const UPPids = [227];

      /**
       * Toggles the specified value in the given array.
       * If the value is already in the array, it is removed.
       * If the value is not in the array, it is added.
       * @param {Array} array - The array to toggle the value in.
       * @param {*} value - The value to toggle in the array.
       */
      function toggleOption(array, value) {
        const index = array.indexOf(value);
        if (index !== -1) {
          array.splice(index, 1);
        } else {
          array.push(value);
        }
      }

      /**
       * Creates a slider HTML element with specified properties.
       *
       * @param {string} slider - The ID of the slider element.
       * @param {string} leftText - The text to display on the left side of the slider.
       * @param {string} rightText - The text to display on the right side of the slider.
       * @param {Function} startValueFunction - A function that returns the starting value of the slider.
       * @param {number} minVal - The minimum value of the slider.
       * @param {number} maxVal - The maximum value of the slider.
       * @param {number} stepVal - The step value of the slider.
       * @param {string} [callback=""] - The function to call when the slider value changes.
       * @returns {string} The HTML code for the slider element.
       */
      function createSlider(
          slider,
          leftText,
          rightText,
          startValueFunction,
          minVal,
          maxVal,
          stepVal,
          callback
      ) {
        if (!callback) callback = "";
        return (
            '<div class="sliderBox">' +
            '<div style="float:left;" class="smallFancyButton">' +
            leftText +
            '</div><div style="float:right;" class="smallFancyButton" id="' +
            slider +
            'RightText">' +
            rightText.replace("[$]", startValueFunction()) +
            '</div><input class="slider" style="clear:both;" type="range" min="' +
            minVal +
            '" max="' +
            maxVal +
            '" step="' +
            stepVal +
            '" value="' +
            startValueFunction() +
            '" onchange="' +
            callback +
            '" oninput="' +
            callback +
            '" onmouseup="PlaySound(\'snd/tick.mp3\');" id="' +
            slider +
            '"/></div>'
        );
      }

      /**
       * Creates a button element with the given title, setting key, and label.
       * @param {string} title - The title of the button.
       * @param {string} settingKey - The key of the setting associated with the button.
       * @param {string} [label] - The label to display next to the button.
       */
      function createButton(title, settingKey, label) {
        const div = document.createElement("div");
        const a = document.createElement("a");
        const optionIndex = settings.options.indexOf(settingKey);

        a.className = `smallFancyButton prefButton option ${
            optionIndex !== -1 ? "" : "off"
        }`;
        a.innerText = `${title} ${optionIndex !== -1 ? "启用" : "禁用"}`;
        a.onclick = function () {
          toggleOption(settings.options, settingKey);
          PlaySound("snd/tick.mp3");
          Game.UpdateMenu();
        };

        div.appendChild(a);

        if (label) {
          const labelElement = document.createElement("label");
          labelElement.innerText = label;
          div.appendChild(labelElement);
        }

        listing.appendChild(div);
      }

      const listing = document.createElement("div");
      listing.className = "listing";

      let a = document.createElement("a");
      const smallFancyButtonClass = "smallFancyButton";
      const prefButtonClass = "prefButton";

      a.className = `${smallFancyButtonClass} ${prefButtonClass} option${
          settings[id] > 0 ? "" : " off"
      }`;
      a.innerText = `${name} ${values[settings[id]]}`;
      a.onclick = function () {
        const newValue = (settings[id] + 1) % Object.entries(values).length;
        settings[id] = newValue;

        if (
            id === "autobuy" &&
            settings[id] &&
            settings.options.indexOf("ABExpand") == -1
        ) {
          settings.options.push("ABExpand");
        } else if (
            id === "wrinklers" &&
            settings[id] &&
            settings.options.indexOf("AWExpand") == -1
        ) {
          settings.options.push("AWExpand");
        } else if (
            id === "gold" &&
            settings[id] &&
            settings.options.indexOf("AGExpand") == -1
        ) {
          settings.options.push("AGExpand");
        }

        PlaySound("snd/tick.mp3");
        Game.UpdateMenu();
      };

      listing.appendChild(a);

      if (id === "autobuy") {
        let a = document.createElement("a");
        a.className = `smallFancyButton`;
        a.innerText = `${
            settings.options.indexOf("ABExpand") != -1
                ? "折叠选项"
                : "展开选项"
        }`;
        a.onclick = function () {
          if (settings.options.indexOf("ABExpand") != -1) {
            settings.options.splice(settings.options.indexOf("ABExpand"), 1);
          } else {
            settings.options.push("ABExpand");
          }
          PlaySound("snd/tick.mp3");
          Game.UpdateMenu();
        };
        listing.appendChild(a);
      }

      if (id === "wrinklers") {
        let a = document.createElement("a");
        a.className = `smallFancyButton`;
        a.innerText = `${
            settings.options.indexOf("AWExpand") != -1
                ? "折叠选项"
                : "展开选项"
        }`;
        a.onclick = function () {
          if (settings.options.indexOf("AWExpand") != -1) {
            settings.options.splice(settings.options.indexOf("AWExpand"), 1);
          } else {
            settings.options.push("AWExpand");
          }
          PlaySound("snd/tick.mp3");
          Game.UpdateMenu();
        };
        listing.appendChild(a);
      }

      if (id === "gold") {
        let a = document.createElement("a");
        a.className = `smallFancyButton`;
        a.innerText = `${
            settings.options.indexOf("AGExpand") != -1
                ? "折叠选项"
                : "展开选项"
        }`;
        a.onclick = function () {
          if (settings.options.indexOf("AGExpand") != -1) {
            settings.options.splice(settings.options.indexOf("AGExpand"), 1);
          } else {
            settings.options.push("AGExpand");
          }
          PlaySound("snd/tick.mp3");
          Game.UpdateMenu();
        };
        listing.appendChild(a);
      }

      var label = document.createElement("label");
      label.innerText = `(${description})`;
      listing.appendChild(label);

      if (id === "autobuy" && settings[id]) {
        var labelabmsg = document.createElement("div");
        labelabmsg.innerHTML = `<p><h2 style="font-size:1em;">${ACABM.abmessage["buy"]}</h2></p>`;
        listing.appendChild(labelabmsg);
        let a = document.createElement("a");
        a.className = `smallFancyButton`;
        a.innerText = `手动刷新`;
        a.onclick = function () {
          PlaySound("snd/tick.mp3");
          Game.UpdateMenu();
        };
        listing.appendChild(a);
        var label = document.createElement("label");
        label.innerText = `(如果你需要的话，手动刷新自动购买所需等待时间。)`;
        listing.appendChild(label);
      }

      if (id === "ascendluck" && ACABM.abmessage["ALmsg"]) {
        var labelalmsg = document.createElement("div");
        labelalmsg.innerHTML = `<p><h2 style="font-size:1em;">${ACABM.abmessage["ALmsg"]}</h2></p>`;
        listing.appendChild(labelalmsg);
      }

      if (id === "krumblor" && ACABM.abmessage["AKmsg"]) {
        var labelakmsg = document.createElement("div");
        labelakmsg.innerHTML = `<p><h2 style="font-size:1em;">${ACABM.abmessage["AKmsg"]}</h2></p>`;
        listing.appendChild(labelakmsg);
      }

      if (
          (id === "autobuy" &&
              settings[id] &&
              settings.options.indexOf("ABExpand") != -1) ||
          (id === "autobuy" && settings.options.indexOf("ABExpand") != -1)
      ) {
        var labelupgrades = document.createElement("div");
        labelupgrades.innerHTML = `<p></p><p><div style="font-size:1em;">升级保险箱<label>启用时，选中的升级将不会自动购买。这是为那些尚未获得 Inspired Checklist 升级到 Vault 的人准备的。这是一个静态列表，如果你想添加更多，请前往创意工坊上提交评论。</label></div></p>`;
        for (var i = 0; i < UPPids.length; i++) {
          let UUP = Game.UpgradesById[UPPids[i]];
          let a = document.createElement("a");
          a.className = `smallFancyButton prefButton option${
              settings.upgradevault.indexOf(UUP.id) != -1 ? "" : " off"
          }`;
          a.innerText = `${UUP.dname} ${
              settings.upgradevault.indexOf(UUP.id) != -1 ? "启用" : "禁用"
          }`;
          a.onclick = function () {
            if (settings.upgradevault.indexOf(UUP.id) != -1) {
              settings.upgradevault.splice(
                  settings.upgradevault.indexOf(UUP.id),
                  1
              );
            } else {
              settings.upgradevault.push(UUP.id);
            }
            PlaySound("snd/tick.mp3");
            Game.UpdateMenu();
          };
          labelupgrades.appendChild(a);
        }

        var labeltech = document.createElement("div");
        labeltech.innerHTML = `<p></p><p><div style="font-size:1em;">科技升级保险箱<label>启用时，选中的科技将不会自动购买。</label></div></p>`;
        for (var i = 0; i < Game.UpgradesByPool["tech"].length; i++) {
          let UBP = Game.UpgradesByPool["tech"][i];
          let a = document.createElement("a");
          a.className = `smallFancyButton prefButton option${
              settings.upgradevault.indexOf(UBP.id) != -1 ? "" : " off"
          }`;
          a.innerText = `${UBP.dname} ${
              settings.upgradevault.indexOf(UBP.id) != -1 ? "启用" : "禁用"
          }`;
          a.onclick = function () {
            if (settings.upgradevault.indexOf(UBP.id) != -1) {
              settings.upgradevault.splice(
                  settings.upgradevault.indexOf(UBP.id),
                  1
              );
            } else {
              settings.upgradevault.push(UBP.id);
            }
            PlaySound("snd/tick.mp3");
            Game.UpdateMenu();
          };
          labeltech.appendChild(a);
        }

        var labelbuildings = document.createElement("div");
        labelbuildings.innerHTML = `<p></p><p><div style="font-size:1em;">建筑保险箱<label>启用时，选中的建筑将不会自动购买。</label></div></p>`;
        for (var i = 0; i < Game.ObjectsById.length; i++) {
          let UBI = Game.ObjectsById[i];
          let a = document.createElement("a");
          a.className = `smallFancyButton prefButton option ${
              settings.buildingvault.indexOf(UBI.id) != -1 ? "" : " off"
          }`;
          a.innerText = `${UBI.dname} ${
              settings.buildingvault.indexOf(UBI.id) != -1 ? "启用" : "禁用"
          }`;
          a.onclick = function () {
            if (settings.buildingvault.indexOf(UBI.id) != -1) {
              settings.buildingvault.splice(
                  settings.buildingvault.indexOf(UBI.id),
                  1
              );
            } else {
              settings.buildingvault.push(UBI.id);
            }
            PlaySound("snd/tick.mp3");
            Game.UpdateMenu();
          };
          labelbuildings.appendChild(a);
        }

        listing.appendChild(labelupgrades);
        listing.appendChild(labeltech);
        listing.appendChild(labelbuildings);
      } else if (id === "hotkeys" && settings[id]) {
        const labelhotkeys = document.createElement("div");
        const h4 = document.createElement("h4");
        h4.style.fontSize = "1.25em";
        h4.innerText = "键盘快捷键";
        labelhotkeys.appendChild(h4);

        const p1 = document.createElement("p");
        p1.innerHTML = `M <label>自动点击大饼干</label>`;
        labelhotkeys.appendChild(p1);

        const div1 = document.createElement("div");
        div1.className = "listing";
        const p2 = document.createElement("p");
        p2.innerHTML = `Shift+1 <label>增加点击间隔</label>`;
        const p3 = document.createElement("p");
        p3.innerHTML = `Shift+2 <label>减少点击间隔</label>`;
        div1.appendChild(p2);
        div1.appendChild(p3);
        labelhotkeys.appendChild(div1);

        const p4 = document.createElement("p");
        p4.innerHTML = `G <label>自动点击黄金饼干、驯鹿饼干、愤怒饼干。</label>`;
        labelhotkeys.appendChild(p4);

        const p5 = document.createElement("p");
        p5.innerHTML = `F <label>自动在狂热/幸运期间点击大饼干。</label>`;
        labelhotkeys.appendChild(p5);

        const p6 = document.createElement("p");
        p6.innerHTML = `A <label>自动购买“最优CpS”的升级、建筑。</label>`;
        labelhotkeys.appendChild(p6);

        const div2 = document.createElement("div");
        div2.className = "listing";
        div2.innerHTML = `注意本功能不是只会购买你买得起的建筑/升级，而是会尝试购买最优的建筑/升级。<br>如果你当前没看到本功能自动购买，那是因为它正在等待最优的选项变得买得起。<br>等最优选项买得起时，将会在 150 秒内自动购买。<br>你可以在屏幕下方看到“等待 X 秒以购买 XX”`;
        labelhotkeys.appendChild(div2);

        const p7 = document.createElement("p");
        p7.innerHTML = `S <label>在等待购买最优建筑/升级时在屏幕下方弹出提示</label>`;
        labelhotkeys.appendChild(p7);

        const p8 = document.createElement("p");
        p8.innerHTML = `P <label>计算触发狂热/幸运所需的饼干数，以确保不会买东西买过头。</label>`;
        labelhotkeys.appendChild(p8);

        const p9 = document.createElement("p");
        p9.innerHTML = `N <label>自动点击幸运纸条。</label>`;
        labelhotkeys.appendChild(p9);

        const p10 = document.createElement("p");
        p10.innerHTML = `W <label>饼干虫超过你设置的数量上限后，自动戳破收益最大的那只（闪光饼干虫除外）</label>`;
        labelhotkeys.appendChild(p10);

        const p11 = document.createElement("p");
        p11.innerHTML = `Z <label>当你威望等级中包含四个 "7" 时自动飞升，以解锁 'Lucky Payout' 成就（如果已经有这个成就了，则本功能无效）</label>`;
        labelhotkeys.appendChild(p11);

        listing.appendChild(labelhotkeys);
      } else if (id === "main" && settings[id]) {
        var labelautoclick = document.createElement("div");
        var slider = createSlider(
            "ACABMClickSlider",
            loc("自动点击速度"),
            "[$]/ms",
            function () {
              return ACABM.settings["mainspeed"];
            },
            50,
            3000,
            50,
            "Game.mods['Auto click and buy Mod'].settings.mainspeed=Number(l('ACABMClickSlider').value);l('ACABMClickSliderRightText').innerHTML=l('ACABMClickSlider').value + '/ms';"
        );
        labelautoclick.innerHTML = slider;
        listing.appendChild(labelautoclick);
      } else if (
          (id === "wrinklers" &&
              settings[id] &&
              settings.options.indexOf("AWExpand") != -1) ||
          (id === "wrinklers" && settings.options.indexOf("AWExpand") != -1)
      ) {
        if (
            settings.wrinklersmax == -1 ||
            settings.wrinklersmax > Game.getWrinklersMax() - 1
        ) {
          settings.wrinklersmax = Game.getWrinklersMax() - 1;
        }
        var labelwrinklers = document.createElement("div");
        var slider = createSlider(
            "ACABMWrinklersSlider",
            loc("最大保留饼干虫数量"),
            "[$]",
            function () {
              return ACABM.settings["wrinklersmax"];
            },
            0,
            Game.getWrinklersMax() - 1,
            1,
            "Game.mods['Auto click and buy Mod'].settings.wrinklersmax=Number(l('ACABMWrinklersSlider').value);l('ACABMWrinklersSliderRightText').innerHTML=l('ACABMWrinklersSlider').value;"
        );
        labelwrinklers.innerHTML = slider;
        listing.appendChild(labelwrinklers);

        createButton(
            "戳破闪光饼干虫",
            "popSW",
            "(启用后，将会在没有任何普通饼干虫、且闪光饼干虫超出你所设置的最大数量后，戳破最大收益的闪光饼干虫)"
        );
      } else if (
          (id === "gold" &&
              settings[id] &&
              settings.options.indexOf("AGExpand") != -1) ||
          (id === "gold" && settings.options.indexOf("AGExpand") != -1)
      ) {
        createButton(
            "黄金饼干",
            "goldenAC",
            "(启用后将会自动点击黄金饼干)"
        );
        createButton(
            "愤怒饼干",
            "wrathAC",
            "(启用后将会自动点击愤怒饼干)"
        );
        createButton(
            "跳过强制愤怒饼干",
            "wrathACS",
            "(启用后，将不会点击强制愤怒饼干（超过一定概率获得负面特性的愤怒饼干）)"
        );
        createButton(
            "驯鹿饼干",
            "reindeerAC",
            "(启用后将会自动点击驯鹿饼干)"
        );
      }
      return listing;
    },
  };

  /**
   * Register the mod to Cookie Clicker
   */
  Game.registerMod("Auto click and buy Mod", ACABM);
})();
