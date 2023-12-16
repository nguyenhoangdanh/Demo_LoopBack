import { FilterList, FilterListItem, useListFilterContext } from "react-admin";
import { Button, Card, CardContent, Drawer, Stack } from "@mui/material";
import {
  AssignmentIndOutlined,
  SellOutlined,
  TaskAltOutlined,
  TypeSpecimenOutlined,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL, IStatus, ITag, IType, IUser, PATH } from "@/common";
import { LbProviderGetter } from "@/helpers";
import _ from "lodash";
import { makeStyles } from "@mui/styles";
import { IWhere } from ".";

type Filters = {
  [key: string]: IUser | IType | IStatus | ITag[];
};

type Value = {
  [key: string]: IUser | IType | IStatus | ITag;
};

interface FilterSidebarProps {
  setWhere: React.Dispatch<React.SetStateAction<IWhere>>;
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

const useStyles: any = makeStyles(() => {
  return {
    stackContainer: {
      height: "100%",
    },
    cardContainer: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      overflowY: "auto",
    },
    clearButton: {
      width: "84%",
    },
  };
});

const FilterIssuesSidebar: React.FC<FilterSidebarProps> = ({
  setWhere,
  isDrawerOpen,
  closeDrawer,
}) => {
  const [authors, setAuthors] = useState<IUser[]>([]);
  const [types, setTypes] = useState<IType[]>([]);
  const [status, setStatus] = useState<IStatus[]>([]);
  const [tags, setTags] = useState<ITag[]>([]);

  const classes = useStyles();

  const { setFilters } = useListFilterContext();

  const getAuthors = useCallback(async () => {
    const authorsRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.USERS}`,
      {
        method: "get",
        query: {
          filter: {
            include: [
              {
                relation: "profile",
              },
            ],
          },
        },
      }
    );
    setAuthors(authorsRes.data.data);
  }, []);

  const getTypes = useCallback(async () => {
    const typesRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.TYPES}`,
      {
        method: "get",
      }
    );

    setTypes(typesRes.data);
  }, []);

  const getStatus = useCallback(async () => {
    const statusRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.STATUS}`,
      {
        method: "get",
      }
    );

    setStatus(statusRes.data);
  }, []);
  const getTags = useCallback(async () => {
    const tagsRes: any = await LbProviderGetter({ baseUrl: BASE_URL }).send(
      `${PATH.TAGS}`,
      {
        method: "get",
      }
    );

    setTags(tagsRes.data);
  }, []);

  const getPrincipalByIds = async (principalIds: number[], path: string) => {
    const issueIds: { id: number | null }[] = [];

    const response: any = await LbProviderGetter({
      baseUrl: BASE_URL,
    }).send(path, {
      method: "get",
      query: {
        filter: {
          include: ["issues"],
          where: { id: { inq: principalIds } },
        },
      },
    });
    const principals = response.data;

    for (const principal of principals) {
      const listIssueIds =
        principal?.issues?.map((issue: any) => ({ id: issue?.id })) ?? [];
      issueIds.push(...listIssueIds);
    }

    return { issueIds };
  };

  const handleSelectAuthors = async (option: IUser | null) => {
    if (option) {
      setWhere((prev) => {
        return {
          ...prev,
          authorId: option.id.toString(),
        };
      });
    } else {
      setWhere((prev) => {
        const { authorId, ...rest } = prev;
        return { ...rest };
      });
    }
  };

  const handleChangeType = (option: IType | null) => {
    if (option) {
      setWhere((prev) => {
        return {
          ...prev,
          typeId: option.id,
        };
      });
    } else {
      setWhere((prev) => {
        const { typeId, ...rest } = prev;
        return { ...rest };
      });
    }
  };

  const handleChangeStatus = (option: IStatus | null) => {
    if (option) {
      setWhere((prev) => {
        return {
          ...prev,
          statusId: option.id,
        };
      });
    } else {
      setWhere((prev) => {
        const { statusId, ...rest } = prev;
        return { ...rest };
      });
    }
  };
  const handleChangeTags = async (options: ITag[]) => {
    const tagIds = options.map((tag) => tag.id);
    const { issueIds } = await getPrincipalByIds(tagIds, PATH.TAGS);

    const conditions =
      options.length && !issueIds.length ? [{ id: null }] : issueIds;
    setWhere({
      and: [
        {
          or: conditions,
        },
      ],
    });
  };

  const isSelected = (
    filterName: string,
    value: Value,
    filters: Filters
  ): boolean => {
    let filterValues: any = filters[filterName];
    if (filterName === "tags") {
      filterValues = (filterValues || []) as ITag[];
      return filterValues.some(
        (filter: any) => filter?.id === value[filterName]?.id
      );
    }

    return filterValues?.id === value[filterName]?.id;
  };

  const toggleFilter = (
    filterName: string,
    value: Value,
    filters: Filters
  ): Filters => {
    const filterValues: any = filters[filterName];

    // Handle the previous value
    if (filters[filterName]) {
      // Remove the previous value
      delete filters[filterName];
    }

    const filterResult: Filters =
      value[filterName]?.id === filterValues?.id
        ? { ...filters }
        : { ...filters, [filterName]: value[filterName] };

    switch (filterName) {
      case "authors":
        handleSelectAuthors(filterResult[filterName] as IUser);
        break;
      case "types":
        handleChangeType(filterResult[filterName] as IType);
        break;
      case "status":
        handleChangeStatus(filterResult[filterName] as IStatus);
        break;
      case "tags":
        let tagFilter = (filterValues || []) as ITag[];
        const updatedFilter = tagFilter.some(
          (filter: any) => filter?.id === value[filterName]?.id
        )
          ? tagFilter.filter((v) => v?.id !== value[filterName]?.id)
          : [...tagFilter, value[filterName] as ITag];

        handleChangeTags(updatedFilter);
        return {
          ...filters,
          [filterName]: updatedFilter as ITag[],
        };
      default:
        break;
    }

    return filterResult;
  };

  const resetFilter = () => {
    setFilters({}, null, false);
    // Reset filter
    setWhere({} as IWhere);
  };

  useEffect(() => {
    resetFilter();
    Promise.all([getAuthors(), getTypes(), getStatus(), getTags()]);
  }, []);

  return (
    <Drawer anchor="right" open={isDrawerOpen} onClose={closeDrawer}>
      <Stack className={classes.stackContainer}>
        <Card className={classes.cardContainer}>
          <CardContent>
            {authors.length > 0 && (
              <FilterList label="Authors" icon={<AssignmentIndOutlined />}>
                {authors.map((author) => (
                  <FilterListItem
                    key={author?.id}
                    label={author?.profile?.fullName}
                    value={{ authors: author }}
                    isSelected={(value, filters) =>
                      isSelected("authors", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("authors", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
            {types.length > 0 && (
              <FilterList label="Types" icon={<TypeSpecimenOutlined />}>
                {types.map((type) => (
                  <FilterListItem
                    key={type.id}
                    label={type.name}
                    value={{ types: type }}
                    isSelected={(value, filters) =>
                      isSelected("types", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("types", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
            {status.length > 0 && (
              <FilterList label="Status" icon={<TaskAltOutlined />}>
                {status.map((value) => (
                  <FilterListItem
                    key={value.id}
                    label={value.name}
                    value={{ status: value }}
                    isSelected={(value, filters) =>
                      isSelected("status", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("status", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
            {tags.length > 0 && (
              <FilterList label="Tags" icon={<SellOutlined />}>
                {tags.map((tag) => (
                  <FilterListItem
                    key={tag.id}
                    label={tag.name}
                    value={{ tags: tag }}
                    isSelected={(value, filters) =>
                      isSelected("tags", value, filters)
                    }
                    toggleFilter={(value, filters) =>
                      toggleFilter("tags", value, filters)
                    }
                  />
                ))}
              </FilterList>
            )}
          </CardContent>
          <Button
            sx={{ m: 3 }}
            className={classes.clearButton}
            color="primary"
            onClick={resetFilter}
          >
            Clear All
          </Button>
        </Card>
      </Stack>
    </Drawer>
  );
};

export default FilterIssuesSidebar;
