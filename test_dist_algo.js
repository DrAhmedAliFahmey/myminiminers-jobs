const getRandomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
const ourarray = [];
const aaa =[];
let z=0;
const more = [0,0];
for(let i=0;i<1000;i++){
	const index = getRandomInt(0,13);
	if(z===360){
		z=0
	}
	if(aaa[index] === undefined){
		aaa[index] = 0;
	}
	aaa[index]+=1
	ourarray.push(getRandomInt(0,1));
	console.log(Math.sin(z/360))
	if(Math.sin(z/360) > 0){
		more[0]++
	}
	else{
		more[1]++

	}
	z++;
}
let sum = ourarray.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
let avg = (sum / ourarray.length) || 0;
console.log(more)
