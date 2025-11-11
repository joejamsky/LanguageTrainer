import { ROW_TIERS } from "../../Data/skillTreeConfig";
import { getShapeGroupCount } from "../../Misc/levelUtils";

export const TOTAL_ROWS = ROW_TIERS.length;
export const TOTAL_SHAPE_GROUPS = getShapeGroupCount();
