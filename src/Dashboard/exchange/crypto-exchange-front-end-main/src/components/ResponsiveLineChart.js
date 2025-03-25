import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Line, Area, Chart, Tooltip } from "react-native-responsive-linechart";
import { useSelector } from "react-redux";

const ResponsiveLineChart = ({ symbol, width, height }) => {
    const state = useSelector((state) => state);
    const [data,setdata]=useState( [[1740224820000, "2734.67000000", "2737.42000000", "2734.42000000", "2737.09000000", "158.84140000", 1740224879999, "434611.72148000", 1504, "113.27940000", "309939.03328200", "0"], [1740224880000, "2737.08000000", "2738.00000000", "2736.77000000", "2736.77000000", "109.88640000", 1740224939999, "300800.68330700", 1503, "40.55690000", "111015.97197400", "0"], [1740224940000, "2736.76000000", "2738.54000000", "2736.31000000", "2736.32000000", "134.76830000", 1740224999999, "368936.81195600", 2524, "50.18270000", "137363.49881500", "0"]]);
    useEffect(()=>{
        async function getChart(name) {
            await fetch(
                `https://api.binance.com/api/v1/klines?symbol=${name==="USDT"?"USDC":name}USDT&interval=1h&limit=30`,
                {
                    method: "GET",
                }
            )
                .then((resp) => resp.json())
                .then((resp) => {
                    if(resp.msg==="Invalid symbol."||resp.code==="-1100")
                    {
                        getChart1(name)
                    }
                    if(Array.isArray(resp))
                    {
                        setdata(resp)
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        async function getChart1(name) {
            await fetch(
                `https://api.binance.com/api/v1/klines?symbol=${name}USD&interval=1h&limit=30`,
                {
                    method: "GET",
                }
            )
                .then((resp) => resp.json())
                .then((resp) => {
                    if(resp.msg==="Invalid symbol."||resp.code==="-1100")
                    {
                        console.log("-----",resp)
                    }
                    if(Array.isArray(resp))
                    {
                        setdata(resp)
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        getChart(symbol)
    },[])

    const formattedData = data.map((item, index) => ({
        x: index,
        y: parseFloat(item[4]),
    }));
    const [linecolor, setLinecolor] = useState("#fff");
    const [pointsData, setPointsData] = useState("");

useEffect(() => {
    if (formattedData.length > 0) {
        const firstValue = "$" + formattedData[0].y;
        setPointsData(prev => prev !== firstValue ? firstValue : prev);
    }

    if (formattedData.length > 1) {
        const lastClose = formattedData[formattedData.length - 1].y;
        const prevClose = formattedData[formattedData.length - 2].y;

        setLinecolor(lastClose > prevClose ? "#00FF00" : lastClose < prevClose ? "#FF0000" : "#808080");
    }
}, [formattedData]); 


    const fluctuatedData = formattedData.map((d, index) => ({
        x: d.x,
        y: d.y + (Math.random() * 2 - 1) * 3 
    }));
    
    return (
        <View style={{ width, height, marginTop: 2, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: state.THEME.THEME===false?"black":"#FFFFFF", fontSize: 12, fontWeight: "600" }}>{pointsData}</Text>
            <Chart
                style={{ width, height: height - 25 }}
                data={fluctuatedData}
                padding={{ left: 3, bottom: 0, right: 3 }}
                xDomain={{ min: 0, max: fluctuatedData.length - 1 }}
                yDomain={{ 
                    min: Math.min(...fluctuatedData.map(d => d.y)) - 10,  // More space
                    max: Math.max(...fluctuatedData.map(d => d.y)) + 10  
                }}
            >
                <Area theme={{ gradient: { from: { color: linecolor, opacity: 0.2 }, to: { color: linecolor, opacity: 0.05 } }}} />
                <Line
                    data={fluctuatedData}
                    tooltipComponent={
                        <Tooltip 
                            theme={{
                                formatter: ({ y }) => setPointsData("$ " + y.toFixed(2)),
                                shape: { width: 0, height: 0, dx: 0, dy: 0, color: "black" }
                            }}
                        />
                    }
                    theme={{
                        stroke: { color: linecolor, width: 2.5 }, // Slightly thicker line
                        scatter: {
                            selected: { width: 5, height: 5, rx: 5, color: "#2F7DFF" }
                        }
                    }}
                    smoothing="cubic-spline" // Better curve
                />
            </Chart>
        </View>
    );
}    

export default ResponsiveLineChart;