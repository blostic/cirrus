from PIL import Image

for i in range(1, 10):
	img = Image.open("image-000000"+ str(i) + ".png")
	area = (300, 430, 400, 530)
	cropped_img = img.crop(area)
	# cropped_img.show()
	resized = cropped_img.resize((200, 200), Image.ANTIALIAS)

	resized.save("res"+ str(i) + ".png")


for i in range(10, 13):
	img = Image.open("image-00000"+ str(i) + ".png")
	area = (300, 430, 400, 530)
	cropped_img = img.crop(area)
	# cropped_img.show()
	resized = cropped_img.resize((200, 200), Image.ANTIALIAS)

	resized.save("res"+ str(i) + ".png")