# Change Log

0.0.15

-   BIG UPDATE
-   replaces all the level art with new assets
-   Includes the .tmx levels for Tiled
-   Tiled is now a 'must have' utility for making levels
-   Maps are loaded according to tiled properties (opacity, etc) this will be more tightly integrated over time

0.0.14

-   Complete the player animtaions to include more particles on certain behaviors and add the vulcan cannon.

0.0.13

-   Removes some unused experimental css
-   Adds the sliding behaviors and also the 'shoot missiles' (which doesnt launch them just yet)

0.0.12

-   Move the player into its own file, that's an Arcade Sprite.
-   Extracts the player behavirs into a Finite State machine
-   Creation fo the animation sequencer to make animations easier to play one after another
-   ES6 classes for the finite state machine that drives player behavior
-   Reproduces the walk animations as a hierarchical FSM
-   Pulls some simple tools, like the Linear Scale tool into its own lib
-   rudimentary jetpack, flying behavior, landing, etc.
-   add flares particle effects (currently jsut using the ones fromt he demos)

0.0.11

-   Create the tilemap processing pipeline

0.0.10

-   Minor fixes after fixing debugging

0.0.9

-   Fix colliders (minor tweak)

0.0.8

-   Fix test level (minor tweak)

0.0.7

-   Initial load of a second scene, as well as a basic level and player. Doesnt do all things a player cna do yet

0.0.6

-   This resolves an issue related to using Browsersync with anything in a VM

0.0.5

-   update the readme, show versions in the running app

0.0.4

-   update Phaser to 3.10.1
-   update other dependencies, like babel, webpack, etc.

0.0.3

-   Adds more babel transforms, like support for decorators and class properties!
-   Adds an import sorter
-   Moves .babelrc to the package.json
-   improves eslint
-   update dependencies

0.0.2

-   Merely adds a player image to the title screen to make it nicer

0.0.1

-   init project
-   include the webpack bundle visualizer
-   include complexity reporting
-   configure webpack and preprocesing
-   configure project to handle pixelart
-   Create boilerplate
-   include fontloader
-   make some start screen adn level assets to demonstrate the project
-   make start screen
