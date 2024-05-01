import { useEffect, useState } from 'react';
import Highcharts, { Options } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import moment from 'moment';

Highcharts.setOptions({
    lang: {
        rangeSelectorZoom: 'Granularity'
    },
    rangeSelector: {
        inputEnabled: false,
        allButtonsEnabled: true,
        buttonTheme: {
            width: 60
        }
    },
    scrollbar: {
        enabled: false,
    },
});

export default function ReportsPage() {
    const [seriesData, setSeriesData] = useState<number[][] | []>([]);
    const [type, setType] = useState<'line' | 'bar'>('line');
    const setLine = () => setType('line');
    const setBar = () => setType('bar');

    useEffect(() => {
        const loadData = async () => {
            try {
                const resp = await axios.get<number[][]>('http://localhost:4444/reports');
                setSeriesData(resp.data);
            } catch (error) {
                console.log(error);
            }
        };

        if (seriesData.length === 0) {
            loadData();
        }
    }, []);

    const options: Options = {
        title: {
            text: 'Income from flights'
        },
        xAxis: {
            plotLines: [{
                color: 'black',
                dashStyle: 'Dash',
                value: type === 'line' ? new Date().getTime() : 0,
                width: 1,
                zIndex: 2,
                label: {
                    text: 'Current Day',
                    align: 'center',
                    y: 50
                }
            }]
        },
        navigator: {
            enabled: false,
        },
        tooltip: {
            formatter: function () {
                return [type === 'line' ? moment(this.x).format("YYYY-MM-DD") : ""].concat(
                    this.points ?
                        this.points.map(function (point) {
                            return point.y?.toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' PLN';
                        }) : []
                );
            },
        },
        series: [{ type: type, data: seriesData }],
        rangeSelector: {
            buttons: [{
                text: 'Day',
                events: { click: setLine },
                dataGrouping: {
                    units: [['day', [1]]],
                    forced: true,
                    approximation: 'sum'
                },
            }, {
                text: 'Week',
                events: { click: setLine },
                dataGrouping: {
                    units: [['week', [1]]],
                    forced: true,
                    approximation: 'sum'
                },
            }, {
                text: 'Month',
                events: { click: setBar },
                dataGrouping: {
                    units: [['month', [1]]],
                    forced: true,
                    approximation: 'sum'
                }
            }]
        },
    };

    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                constructorType='stockChart'
                options={options}
            />
        </div>
    );
}

