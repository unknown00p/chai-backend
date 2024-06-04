class apiResponce {
    constructor(data, messege = "success", statusCode) {
        this.statusCode= statusCode
        this.data = data;
        this.messege = messege;
        this.success = statusCode < 400;
    }
}

export{apiResponce}