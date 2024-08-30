# all service layer functions


#-----------------------------------------------------------Funcitons for heat map generation
# helper function to read preset data
# to outpur dict of zone_coor
def read_zone_coor(file_path):
    zone_dict = {} 
    with open(file_path, 'r') as file: 
        for line in file: 

            line = line.rstrip('\n')
            line = line.replace(' ', '')
            parts = line.split(',') 
            zone_name = parts[0] 
            coor = (int(parts[1]), int(parts[2]))
            zone_dict[zone_name] = coor
    return(zone_dict)

file_path = 'test_data/zone_coordinate.txt'
print(read_zone_coor(file_path))

# function 1 
# input:  number_per_zone, a  dictionary {zone_id : number_in_the_zone}
# output: reletive_scal, a dictionary { zone_id : reletive_density}
def generate_crowd_density(number_per_zone):
    pass

# use reletive_scale to generate color code in the form of RGB
import pillow
# function 2
# out put png
def generate_heat_map(zone_coor, radius):


    pass


def generate_final_map():
    pass



#-----------------------------------------------------------Funcitons for check-in ?






#-----------------------------------------------------------Funcitons for alert ?



