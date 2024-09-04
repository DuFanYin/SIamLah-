
<h1> Project for Ellipsis Tech Series Hackathon 2024 </h1>
<h2> Awarded 1st place</h2>

[Peoject proposal, demo video and putch slides](https://drive.google.com/drive/folders/1tsLtgDUuwG4EH23EmiOlaMTn1qXxCQBe?usp=sharing)




<h1>File structure </h1>

- SiamLah.apk                 # release version of the moblie app
- server
    - final_heat_map.png      # heat_map shown for client
    - main.py                 # server entry point
    - map.png                 # event venue map
    - modules.py              # functions uesd at service layer
    - temp_heatmap.png        # intermediate step before final_heatmap
    - zone_coordinate.txt     # preset zone coordiantes
- client
    - App.tsx                 # main client side code




<h1>Funcitons used in service layer</h1>
<h2>Helper functions</h2>
<h3>green_to_red()</h3>
<p>Used to generate RGB color code to color the zone, divided evenly into 5 categaries</p>

<h3>read_zone_coor()</h3>
<p>Used to read the preset zone coordinates. Hared coded, future development will allow organiser to pin the zone coordinates on the event map</p>
<h2>Main funcitons</h2>

<h3>generate_zone_color(zone_number)</h3>
<p>In take the zone number which is a contains the zone_id : number_persons_in. The function uses it to generate the color for each zone, depending on the population density in the zone </p>
<h3>generate_hm(array_size, zone_coor, radius, zone_color) </h3>
<p> Uses pillow library to draw a png with transparent background. Showing the zones as colored circles.</p>
<h3> overlap_images(output_path) </h3>
<p> Over lap the temperary heatmap onto the event venue map to form the final heatmap user will be seeing</p>


Reference

OpenAI. (2024). ChatGPT (31 Aug version) [Large language model]. https://chat.openai.com/chat


