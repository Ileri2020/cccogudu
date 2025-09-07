import cloudinary
from cloudinary import api
import csv
import json



cloudinary.config(
    cloud_name="dc5khnuiu",
    api_key="474889658884221",
    api_secret="iCF8R9GNc0IAPV_mcTy4gaxpn2A"
)

# resources = api.resources(type='upload', resource_type='video')
# for resource in resources['resources']:
#     print(resource['public_id'], resource['url'])


# resources = api.resources(type='upload', resource_type='video')

# with open('video_resources.csv', 'w', newline='') as csvfile:
#     fieldnames = ['Video Name', 'Video URL']
#     writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

#     writer.writeheader()
#     for resource in resources['resources']:
#         writer.writerow({'Video Name': resource['public_id'], 'Video URL': resource['url']})

# print("Video resources saved to video_resources.csv")




resources = api.resources(type='upload', resource_type='video', max_results = 500)
print("cloudinary response", json.dumps(resources, indent=4))

video_resources = []
for resource in resources['resources']:
    video_resources.append({
        'Video Name': resource['public_id'],
        'Video URL': resource['url']
    })

# with open('video_resources.json', 'w') as jsonfile:
#     json.dump(video_resources, jsonfile, indent=4)
    
with open('cldres.json', 'w') as jsonfile:
    json.dump(resources, jsonfile, indent=4)

print("cloudinary resources saved to cldres.json")
