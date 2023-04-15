const locationArray = ["nippani", "athani", "Rajaji Nagar"]
for (let index = 0; index < 1000; index++) {
    const locationIndex = Math.floor(Math.random() * locationArray.length);
    const location = locationArray[locationIndex]
    console.log(location)
}
