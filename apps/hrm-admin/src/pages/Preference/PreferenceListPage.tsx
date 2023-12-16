import {Fragment, useCallback, useEffect, useState} from "react";
import {IPreference, PATH, ROLES} from "@/common";
import {ListContextProvider, useDataProvider, useList} from "ra-core";
import {
    CreateButton,
    Datagrid,
    ExportButton,
    FunctionField,
    NotFound,
    TextField,
    TopToolbar,
    useNotify,
    usePermissions
} from "react-admin";
import {Stack} from "@mui/material";
import FieldWrapper from "@/components/common/FieldWrapper";
import {ActionsField} from "@/components/common";

export const PreferenceListPage = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const[dataPreferenceList, setDataPreferenceList] = useState<IPreference[]>([]);
    const {permissions} = usePermissions();

    const dataResponse = useCallback(async () => {
        const resDataPreference = await dataProvider.send (
            `${PATH.GET_LIST_PREFERENCES}`, {
            method : "GET",
        })
        const data = resDataPreference?.data;
        if (data){
            notify(`Get list preference success`, { type: 'success' });
            setDataPreferenceList(data);
            return data;
        }
        notify(`Get list preference fail`,{type:'error'})
    }, [dataProvider]);

    useEffect(() => {
        dataResponse().then(r => null);
    }, [dataResponse]);


    let data = dataPreferenceList;
    const listContext = useList({data})
    return (
        <Fragment>
            {permissions.includes(ROLES.EMPLOYEE) ? (
              <NotFound/>
            ) : (
              <ListContextProvider value={listContext}>
                  <Stack>
                      <TopToolbar>
                          <CreateButton sx={{width: "5%"}}/>
                          <ExportButton sx={{width: "5%"}}/>
                      </TopToolbar>
                  </Stack>
                  <Datagrid sx={{marginTop: "1%"}}>
                      <TextField source={"id"}/>
                      <FunctionField label={"name"} render={(record : any)=>{
                          return record.code
                      }}/>
                      <TextField source={"description"}/>
                      <TextField source={"value"}/>
                      <FieldWrapper label="Actions" source="actions" sortable={false}>
                          <FunctionField
                            render={(record: Record<string, any>) => {
                                return (
                                  <ActionsField
                                    id={record.id}
                                    actions={new Set(["edit", "delete"])}
                                    resource={PATH.PREFERENCE}
                                  />
                                );
                            }}
                          />
                      </FieldWrapper>
                  </Datagrid>
              </ListContextProvider>
            )}
        </Fragment>
    );
};
