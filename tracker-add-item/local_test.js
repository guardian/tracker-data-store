const trackerAddItem = require('./index');

const event = {
  "Records": [
    {
      "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
      "eventVersion": "1.0",
      "kinesis": {
        "partitionKey": "partitionKey-3",
        "data": "AR+LCAAAAAAAAADtVM1rE0EUH6s2C0ZrFjK+lEH24MFA0m3SfLQQgrXWIvXgIQFPwuzuJF2z2Vl2Zyn1JOqtIl4KevEgPYl48OY/IHoSPKjH3vwHRFAQnOwmmjbaQyzowTnMm/d7b97nzEtP4JcPNrduNwHK1dmWwUrFVtWaLbWqZTpXMBcWjAp++mJ7gvxeTuBM2Mm7bD3Qi7OFik49Xy+UdJN3u8wV1HBYXrBARGbmE55esq7P30BplFLVHMH3I+8ETrdti3F3ps0dy2B++1w7pL5lU3fG5DNhByZXIjkoK30FhAh+9+rL+1vjXn70+t6Hv3EZN1D2ZzlLe8pZJWgcq/jxx14pMiSNiHJttebVYxPaUBu0Xhu05QuXGtFWjI9zMSnFpByTSs3wNb1e0706yiQJHKhBhD/vfJXB4rtb4/Y+1X838IdRHWhimSTKjJNMDk7u9b0LyY8gsc4pGftesBfHL1Qn46AAHWjCbBqRFL658/DNnaaaRudV9erx5dDnHtMvc9firopIpkbw281DkFhlG+vct+DERc6FRl1L6/JQrI3wyZbkJRtxBD85ConmqtYbL5Doz5kfBwRTYUcfvoCkS/xs+zAkl7grZHZaY8NjgBd9YZsyz7MDWEg4C4k+DgkaHwh+fkS2yOEGdWTVdlEESl8riNx8+qaA0vCp2bHdNsBiGAifOjbVlkJHhL50ZrGgk4XUiARSdADlzRja33FO9N1EY9UOApu7kuvZ10dMyeDkn8UKHLsSGo5tUiG1YXr3O9S8IdmUWGND4i4oA27/sJIDNZ06DsomUY7IwqhyQKqq3P+vf359BxIkPz4ACAAA",
        "kinesisSchemaVersion": "1.0",
        "sequenceNumber": "49545115243490985018280067714973144582180062593244200961"
      },
      "invokeIdentityArn": "arn:aws:iam::EXAMPLE",
      "eventName": "aws:kinesis:record",
      "eventSourceARN": "arn:aws:kinesis:EXAMPLE",
      "eventSource": "aws:kinesis",
      "awsRegion": "eu-west-1"
    }
  ]
}

trackerAddItem.handler(event)
