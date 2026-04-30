import { actionPropertiesProvider } from './actionPropertiesProvider'
import { clientOrganisationProvider } from './clientOrganisationProvider'
import { formFieldProvider } from './formFieldProvider'
import type { DataSourceProvider } from '../domain/dataSources'

export const dataSourceProviders: DataSourceProvider[] = [
  actionPropertiesProvider,
  clientOrganisationProvider,
  formFieldProvider,
]
