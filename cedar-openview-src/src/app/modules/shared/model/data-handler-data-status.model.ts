import {DataHandlerDataType} from './data-handler-data-type.model';
import {DataHandlerDataId} from './data-handler-data-id.model';

export class DataHandlerDataStatus {

  dataType: DataHandlerDataType;
  dataId: DataHandlerDataId;
  //
  id: string;
  //
  loaded: boolean = false;
  canceled: boolean = false;

  private constructor() {
  }

  public static forDataId(dataId: DataHandlerDataId): DataHandlerDataStatus {
    const r: DataHandlerDataStatus = new DataHandlerDataStatus();
    r.dataType = DataHandlerDataType.DATA_ID;
    r.dataId = dataId;
    return r;
  }

  public static forDataIdAndId(dataId: DataHandlerDataId, id: string): DataHandlerDataStatus {
    const r: DataHandlerDataStatus = DataHandlerDataStatus.forDataId(dataId);
    r.dataType = DataHandlerDataType.DATA_ID_WITH_ID;
    r.id = id;
    return r;
  }

  getKey(): string {
    if (this.dataType === DataHandlerDataType.DATA_ID) {
      return this.dataId;
    } else if (this.dataType === DataHandlerDataType.DATA_ID_WITH_ID) {
      return this.dataId + ':' + this.id;
    }
  }

}
