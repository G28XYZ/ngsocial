import { DataSource, DataSourceOptions } from "typeorm";
import * as ormconfig from "./ormconfig.json";

export const AppDataSource = new DataSource(ormconfig as DataSourceOptions);
