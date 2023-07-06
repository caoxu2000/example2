import * as path from 'path'


const pathToDemoExams = "home/stealth/juno-integration/test-data/persistent-data-service/exam-data/"

export const dicomExampleFilePath = path.resolve(pathToDemoExams, "dicomtest.dcm")


export const defaultPatient = {
  "id": "MR2668352352",
  "name": "Test Patient"  
}

// Generic Template for body of create Dicom exams request 
const dicomDataTemplate = {
    "patient":{
        "name": "Test Patient",
        "id": "1234",
        "dob": "1/11/1111",
        "sex": "m",
        "removed": "f"
    } ,
    "study":{
        "accession": " ",
        "admittingDiagnoses": " ",
        "date": " ",
        "description": " ",
        "id": " ",
        "instanceUid": "2.16.124.133543.6021.1.2.4727584845.2894.1322776593.1",
        "age": " ",
        "physicians": " ",
        "physiciansReadingStudy": " ",
        "referring_physicians": " ",
        "time": " ",
        "weight": 4 
    },
    "series":{
        "dataLocation": "/home/stealth/juno-integration/test-data/persistent-data-service/exam-data/dicomtest.dcm",
        "date": " ",
        "description": " ",
        "frameOfReferenceUid": " ",
        "instanceUid": "2.16.124.114543.6021.1.2.4727584845.2784.1422776593.1",
        "institution": " ",
        "manufacturer": " ",
        "manufacturerModelName": " ",
        "modality": " ",
        "number": 1,
        "operator": " ",
        "patientPosition": " ",
        "performingPhysician": " ",
        "positionReferenceIndicator": " ",
        "protocol": " ",
        "station": " ",
        "time": " "
  },
  "instances": [{
    "acquisitionDate": " ",
    "acquisitionDateTime": " ",
    "acquisitionTime": " ",
    "bitsAllocated": 1,
    "bitsStored": 1,
    "characterSet": " ",
    "echoTime": 1,
    "fileName": " ",
    "gantryTilt": 1,
    "highBit": 1,
    "instanceCreatorUid": " ",
    "instanceNumber": 1,
    "lossyCompression": " ",
    "lossyCompressionMethod": " ",
    "lossyCompressionRatio": [1, 1, 1],
    "numberOfFrames": 1,
    "photometricInterpretation": " ",
    "pixelRepresentation": 1,
    "repTime": 1,
    "samplesPerPixel": 1,
    "sliceThickness": 1,
    "SOPClassUid": " ",
    "SOPInstanceUid": " ",
    "transferSyntaxUid": " ",
    "windowCenter": 1,
    "windowWidth": 1,
    "xScale": 1,
    "xSize": 1,
    "yScale": 1,
    "ySize": 1
  },
  ],
}


export const success = Object.assign({}, dicomDataTemplate)