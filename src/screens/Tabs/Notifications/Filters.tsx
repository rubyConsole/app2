import { HeaderLeft, HeaderRight } from '@components/Header'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useAppDispatch } from '@root/store'
import { useQueryClient } from '@tanstack/react-query'
import { TabNotificationsStackScreenProps } from '@utils/navigation/navigators'
import { useProfileQuery } from '@utils/queryHooks/profile'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { PUSH_ADMIN, PUSH_DEFAULT, usePushFeatures } from '@utils/slices/instances/push/utils'
import {
  getInstanceNotificationsFilter,
  updateInstanceNotificationsFilter
} from '@utils/slices/instancesSlice'
import { isEqual } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

const TabNotificationsFilters: React.FC<
  TabNotificationsStackScreenProps<'Tab-Notifications-Filters'>
> = ({ navigation }) => {
  const { t } = useTranslation('screenTabs')

  const pushFeatures = usePushFeatures()

  const dispatch = useAppDispatch()

  const instanceNotificationsFilter = useSelector(getInstanceNotificationsFilter)
  const [filters, setFilters] = useState(instanceNotificationsFilter)

  const queryClient = useQueryClient()
  useEffect(() => {
    const changed = !isEqual(instanceNotificationsFilter, filters)
    navigation.setOptions({
      title: t('notifications.filters.title'),
      headerLeft: () => (
        <HeaderLeft
          content='ChevronDown'
          onPress={() => {
            if (changed) {
              Alert.alert(t('common:discard.title'), t('common:discard.message'), [
                {
                  text: t('common:buttons.discard'),
                  style: 'destructive',
                  onPress: () => navigation.goBack()
                },
                {
                  text: t('common:buttons.cancel'),
                  style: 'default'
                }
              ])
            } else {
              navigation.goBack()
            }
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('common:buttons.apply')}
          onPress={() => {
            if (changed) {
              dispatch(updateInstanceNotificationsFilter(filters))
              const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Notifications' }]
              queryClient.invalidateQueries({ queryKey })
            }
            navigation.goBack()
          }}
        />
      )
    })
  }, [filters])

  const profileQuery = useProfileQuery()

  return (
    <ScrollView style={{ flex: 1 }}>
      <MenuContainer>
        {PUSH_DEFAULT(pushFeatures).map((type, index) => (
          <MenuRow
            key={index}
            title={t(`notifications.filters.options.${type}`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
        {PUSH_ADMIN(pushFeatures, profileQuery.data?.role?.permissions).map(({ type }) => (
          <MenuRow
            key={type}
            title={t(`notifications.filters.options.${type}`)}
            switchValue={filters[type]}
            switchOnValueChange={() => setFilters({ ...filters, [type]: !filters[type] })}
          />
        ))}
      </MenuContainer>
    </ScrollView>
  )
}

export default TabNotificationsFilters