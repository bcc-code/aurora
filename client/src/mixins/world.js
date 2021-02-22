import * as d3 from "d3-geo";
import data from '@/data/world/world.js'
import borders from '@/data/world/borders.js'
export default {
    data: function() {
        return {
            world: {}
        }
    },
	computed: {
		ctxWorld() {
			return document.getElementById("worldCanvas").getContext("2d");
        },
        worldPathGenerator() {
            return d3.geoPath(this.projection, this.ctxWorld);
        }
    },
    methods: {
        fetchWorld() {
			this.world = data;
        },
        resetWorld(){
            this.ctxWorld.clearRect(0, 0, this.width, this.height);
        },
        drawWorld(){
            /* Draw a world layer to adjust to the svg background */
            this.ctxWorld.beginPath();
            this.worldPathGenerator(this.world);
            this.ctxWorld.fillStyle = "#00000050";
            this.ctxWorld.fill();
            this.ctxWorld.lineWidth = '.5';
            this.ctxWorld.strokeStyle = "#77777780";
            this.ctxWorld.stroke();
        },
        drawRunningWorld(){
            this.ctxWorld.beginPath();
            this.worldPathGenerator(this.world);
            this.ctxWorld.fillStyle = this.gradient("#4A677B", "#384E69", 0.3, 1);;
            this.ctxWorld.shadowBlur=5;
            this.ctxWorld.shadowColor='#000'; 
            this.ctxWorld.shadowOffsetX=2; 
            this.ctxWorld.shadowOffsetY=2;
            this.ctxWorld.fill();
            this.ctxWorld.shadowBlur=0;
        },
        drawBorders(){
            this.ctxWorld.beginPath();
            this.worldPathGenerator(borders);
            this.ctxWorld.fillStyle = this.gradient("#304360", "#161E3D", 0.3, 1);
            this.ctxWorld.shadowBlur=50;
            this.ctxWorld.shadowColor='#000'; 
            this.ctxWorld.shadowOffsetX=0; 
            this.ctxWorld.shadowOffsetY=0; 
            this.ctxWorld.fill(); 
            this.ctxWorld.shadowBlur=0;
        },
        highlightContinent(continent){
            var result = { ...this.world };
            result.features = result.features ? result.features.filter((el) => continent.includes(el.properties.name)) : result.features
            this.ctxWorld.beginPath();
            this.worldPathGenerator(result);
            this.ctxWorld.fillStyle = this.gradient("#DFCC7F", "#A9751E", 0.6, 1.2);
            this.ctxWorld.fill();
        },
        highlightCountry(country, color){
            var result = { ...this.world };
            result.features = [country];
            this.ctxWorld.beginPath();
            this.worldPathGenerator(result);
            this.ctxWorld.fillStyle = color;
            this.ctxWorld.fill();
        },
        gradient(c1, c2, r1, r2) {
            var o1 = this.projection([0,70]);
            var o2 = this.projection([0,60]);
            var fillGradient = this.ctxWorld.createRadialGradient(o1[0], o1[1], r1*this.projection.scale(), o2[0], o2[1], r2*this.projection.scale());
            fillGradient.addColorStop(0, c1);
            fillGradient.addColorStop(1, c2);
            return fillGradient;
        }
    }
}
