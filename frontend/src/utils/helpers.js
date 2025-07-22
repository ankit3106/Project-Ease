// import moment from "moment";

// export const getAntdFormInputRules = [
//   {
//     required: true,
//     message: "Required",
//   },
// ];

// export const getDateFormat = (date) => {
//   return moment(date).format("MMMM Do YYYY, h:mm A");
// }

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

// Extend dayjs to support advanced formatting (e.g., "Do")
dayjs.extend(advancedFormat);

export const getAntdFormInputRules = [
    {
        required: true,
        message: "Required",
    },
];

export const getDateFormat = (date) => {
    return dayjs(date).format("MMMM Do YYYY, h:mm A");
}