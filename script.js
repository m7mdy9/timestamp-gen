const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

document.addEventListener("DOMContentLoaded", ()=>{
    const date = document.querySelector("#date")
    const time = document.querySelector("#time")
    const type = document.querySelector("#drop_list")
    const timestamp_out = document.querySelector("#output_date")
    const reset_button = document.querySelector("#reset")
    // const timestamp_raw = document.querySelector("#timestamp_raw")
    let current_date = new Date()
    let discord_ts_ms,date_input,time_input,type_input,type_style,discord_ts_output,output_date,relative_status, interval_id;
    
    function getDate(){
        let year = current_date.getFullYear()
        let month = (current_date.getMonth()+1).toString().padStart(2, "0")
        let day = current_date.getDate().toString().padStart(2, "0")
        return `${year}-${month}-${day}`
    }
    function getTime(){
        let hour = current_date.getHours().toString().padStart(2, "0")
        let minutes = current_date.getMinutes().toString().padStart(2, "0")
        return `${hour}:${minutes}`
    }
    function ms_update(){
        discord_ts_ms = Math.floor(current_date.getTime()/1000);
    }
    function relative_diff(target_ms){
        const now = Date.now()
        const diff_in_secs = Math.round((target_ms - now) / 1000)
        const absDiff = Math.abs(diff_in_secs)

        let value,unit;
        if (absDiff < 60) {
            value = absDiff;
            unit = "second";
        } else if (absDiff < 3600) {
            value = Math.round(absDiff / 60);
            unit = "minute";
        } else if (absDiff < 86400) {
            value = Math.round(absDiff / 3600);
            unit = "hour";
        } else if (absDiff < 604800) { // 7 days
            value = Math.floor(absDiff / 86400);
            unit = "day";
        } else if (absDiff < 2629746) { // ~30.44 days
            value = Math.round(absDiff / 604800);
            unit = "week";
        } else if (absDiff < 31556952) { // 365.24 days
            value = Math.round(absDiff / 2629746);
            unit = "month";
        } else {
            value = Math.round(absDiff / 31556952);
            unit = "year";
        }

        const plural = value === "1" ? "" : "s";
        const time_string = `${value} ${unit}${plural}`

        return diff_in_secs >= 0 ? `in ${time_string}` : `${time_string} ago`
    }
    function set_output(){
        let result;
        const used_date = current_date
        const year = used_date.getFullYear()
        const month = used_date.getMonth() + 1
        const month_name = months[used_date.getMonth()]
        const day = used_date.getDate()
        const weekday = days[used_date.getDay()]
        const hours = used_date.getHours()
        const minutes = used_date.getMinutes()
        const short_time = used_date.toLocaleTimeString("en-US",{hour: "numeric",minute: "2-digit"})
        const short_date = `${day}/${month}/${year}`
        const long_date = `${month_name} ${day}, ${year}`
        const full_date = `${weekday}, ${long_date} at ${short_time}`
        if (!type_input === "relative"){
            relative_status = false;
        }
        switch(type_input){
            case "relative":
                type_style = "R"
                relative_status = true
                break;
                case "short_time":
                    type_style = "t"
                    result = short_time
                    break;
                    case "short_date":
                        type_style = "d"
                        result = short_date
                        break;
                        case "long_date":
                            type_style = "D"
                            result = long_date
                            break;
                            case "full_date":
                                type_style = "F"
                                result = full_date;
                                break;
                                case "long_date_short_time":
                                    type_style = 'f'
                                    result = `${long_date} at ${short_time}`
                                    break;
                                    case "short_date_short_time":
                                        type_style = "s"
                                        result = `${short_date}, ${short_time}`
                                        break;
            }
        discord_ts_output = `<t:${discord_ts_ms}:${type_style}>`
        return result
    }
    function update(){
        output_date = set_output();
        if(relative_status === true){
            // return timestamp_raw.textContent = discord_ts_output;
            return;
        }
        timestamp_out.textContent = output_date;
        // timestamp_raw.textContent = discord_ts_output;
    }
    if(!type_input){
        type_input = type.value;
        date.value = getDate()
        time.value = getTime()
    }
    timestamp_out.textContent = relative_diff(current_date)
    setInterval((input)=>{
        if (type_input === "relative" && !timestamp_out.matches(":hover") && timestamp_out.textContent != "Copied to clipboard!"){
            timestamp_out.textContent = relative_diff(current_date)
        }
    }, 1000)

    date.addEventListener('input', (event)=>{
        date_input = event.target.value
        const list_for_dates = date_input.split("-")
        current_date.setFullYear(list_for_dates[0],1,list_for_dates[2])
        ms_update()
        update()
    })
    time.addEventListener('input', (event)=>{
        time_input = event.target.value
        current_times = time_input.split(":")
        current_date.setHours(current_times[0], current_times[1])
        ms_update()
        update()
    })
    type.addEventListener('change', (event)=>{
        type_input = event.target.value
        if (type_input != "relative"){
            relative_status = false
        }
        update()
    })
    timestamp_out.addEventListener('mouseenter', (event)=>{
        if (timestamp_out.textContent != "Copied to clipboard!"){
            event.target.textContent = discord_ts_output
        }
    })
    timestamp_out.addEventListener('click', async (event)=>{
        try {
            await navigator.clipboard.writeText(discord_ts_output)
            event.target.textContent = "Copied to clipboard!"
            event.target.style.fontSize = "clamp(0.7rem, 0.445rem + 1.27vw, 1.4rem)"
            setTimeout(() => {
                event.target.style.fontSize = ""
                if (type_input === "relative") {
                    event.target.textContent = relative_diff(current_date)
                } else {
                    event.target.textContent = set_output()
                }
            }, 1250)
        } catch (err){
            console.log(err)
        }
    })
    timestamp_out.addEventListener('mouseleave', (event)=>{
        if (event.target.textContent != "Copied to clipboard!"){
            if(type_input === "relative"){
                event.target.textContent = relative_diff(current_date)
            } else {
                event.target.textContent = set_output()
            }
        }
    })

    reset_button.addEventListener('click', (event)=>{
        current_date = new Date();
        update()
    })
    ms_update()
    update()
})
