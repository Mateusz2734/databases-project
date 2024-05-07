import { useState } from 'react';
import Highcharts, { Options } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
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
    accessibility: {
        enabled: false,
    }
});

export function Chart(props: { chartData: number[][]; }) {
    const [type, setType] = useState<'line' | 'bar'>('line');
    const setLine = () => setType('line');
    const setBar = () => setType('bar');

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
        series: [{ type: type, data: props.chartData }],
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
        <HighchartsReact
            highcharts={Highcharts}
            constructorType='stockChart'
            options={options}
        />
    );
}