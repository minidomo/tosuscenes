# tosuscenes
A scene overlay for osu! tournaments!

## Usage

1. Download the [latest release](https://github.com/minidomo/tosuscenes/releases/latest)  
Unzip the files and the root folder of the program will contain `tosuscenes.exe`.

2. Run tosuscenes, gosumemory, and osu! tournament client  
- You can view the scenes at http://localhost:50423/ and use the controller to switch scenes and modify data.
- In OBS, add a browser source with the URL above and a width and height of 1920 and 1080, respectively.  
For the match scene, osu! clients should fit the 1920x720 area starting at 155px from the top. For example, in a 1v1 tournament, client 0 should be placed at position 0 and 155 with size 960 and 720 and client 1 should be placed at position 960 and 155 with size 960 and 720 in OBS.
- You can also modify data by editing the `config.json` file located in the directory `resources/app/config.json`.

