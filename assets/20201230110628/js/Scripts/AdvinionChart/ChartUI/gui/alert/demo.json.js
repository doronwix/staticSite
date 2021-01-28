function ProChart_InitDemoAlert(chartObject) {

    var demoData = {
        itemsinfo:[]  
    };


    var iteminfo = null;
    
    // add news



    // node 1
    iteminfo = {
        date: "11:30",
        possition:[45],
        items: [
            { type: "E", content: "" },
            { type: "D", content: "" },
            { type: "N", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);


    // node 2
    iteminfo = {
        date: "13:30",
        possition: [120],
        items: [
            { type: "E", content: "" },
            { type: "D", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);


    // node 3
    iteminfo = {
        date: "15:30",
        possition: [190],
        items: [
            { type: "E", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);



    // node 4
    iteminfo = {
        date: "16:30",
        possition: [250],
        items: [
            { type: "D", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);


    // node 4
    iteminfo = {
        date: "18:30",
        possition: [340],
        items: [
            { type: "N", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);



    // node 5
    iteminfo = {
        date: "19:30",
        possition: [700],
        items: [
            { type: "E", content: "" },
            { type: "D", content: "" },
            { type: "N", content: "" }
          ]
    };

    demoData.itemsinfo.push(iteminfo);



    return demoData;





}