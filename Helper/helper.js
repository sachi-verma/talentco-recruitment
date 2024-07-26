
const monthData = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


exports.formatDate= (date)=>{
    let dateFormat= `${date?.split("-")[2]} ${monthData[parseInt(date?.split("-")[1])]} ${date?.split("-")[0]}`;
    return dateFormat;
}