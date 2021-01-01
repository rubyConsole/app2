import { HeaderRight } from '@components/Header'
import { ParseEmojis, ParseHTML } from '@components/Parse'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { searchFetch } from '@utils/fetches/searchFetch'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from 'react-query'

const ScreenSharedSearch: React.FC = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const { status, data, refetch } = useQuery(
    ['Search', { term: searchTerm }],
    searchFetch,
    { enabled: false }
  )

  const [setctionData, setSectionData] = useState<
    { title: string; data: any }[]
  >([])
  useEffect(
    () =>
      data &&
      setSectionData(
        Object.keys(data as Mastodon.Results)
          .map(key => ({
            title: key,
            // @ts-ignore
            data: data[key]
          }))
          .sort((a, b) => {
            if (!a.data.length) {
              return 1
            } else if (!b.data.length) {
              return -1
            } else {
              return 0
            }
          })
      ),
    [data]
  )

  const onChangeText = useCallback(
    debounce(text => setSearchTerm(text), 1000, {
      trailing: true
    }),
    []
  )
  useEffect(() => {
    if (searchTerm) {
      refetch()
    } else {
      setSectionData([])
    }
  }, [searchTerm])

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyBase}>
        {status === 'loading' ? (
          <View style={styles.loading}>
            <Chase
              size={StyleConstants.Font.Size.M * 1.25}
              color={theme.secondary}
            />
          </View>
        ) : (
          <>
            <Text
              style={[
                styles.emptyDefault,
                styles.emptyFontSize,
                { color: theme.primary }
              ]}
            >
              输入关键词搜索<Text style={styles.emptyFontBold}>用户</Text>、
              <Text style={styles.emptyFontBold}>话题标签</Text>或者
              <Text style={styles.emptyFontBold}>嘟文</Text>
            </Text>
            <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
              高级搜索格式
            </Text>
            <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
              <Text style={{ color: theme.secondary }}>@username@domain</Text>
              {'   '}
              搜索用户
            </Text>
            <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
              <Text style={{ color: theme.secondary }}>#example</Text>
              {'   '}搜索话题标签
            </Text>
            <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
              <Text style={{ color: theme.secondary }}>URL</Text>
              {'   '}搜索指定嘟文
            </Text>
            <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
              <Text style={{ color: theme.secondary }}>URL</Text>
              {'   '}搜索指定用户
            </Text>
          </>
        )}
      </View>
    ),
    [status]
  )
  const sectionHeader = useCallback(
    ({ section: { title } }) => (
      <View
        style={[
          styles.sectionHeader,
          { borderBottomColor: theme.border, backgroundColor: theme.background }
        ]}
      >
        <Text style={[styles.sectionHeaderText, { color: theme.primary }]}>
          {title}
        </Text>
      </View>
    ),
    []
  )
  const sectionFooter = useCallback(
    ({ section: { data, title } }) =>
      !data.length ? (
        <View
          style={[styles.sectionFooter, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.sectionFooterText, { color: theme.secondary }]}>
            找不到{' '}
            <Text style={{ fontWeight: StyleConstants.Font.Weight.Bold }}>
              {searchTerm}
            </Text>{' '}
            相关的{title}
          </Text>
        </View>
      ) : null,
    [searchTerm]
  )
  const listItem = useCallback(({ item, section }) => {
    switch (section.title) {
      case 'accounts':
        return (
          <Pressable
            style={[
              styles.itemDefault,
              styles.itemAccount,
              { borderBottomColor: theme.border }
            ]}
            onPress={() => {
              navigation.goBack()
              navigation.push('Screen-Shared-Account', { account: item })
            }}
          >
            <Image
              source={{ uri: item.avatar_static }}
              style={styles.itemAccountAvatar}
            />
            <View>
              <Text numberOfLines={1}>
                <ParseEmojis
                  content={item.display_name || item.username}
                  emojis={item.emojis}
                  size='S'
                  fontBold
                />
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.itemAccountAcct, { color: theme.secondary }]}
              >
                @{item.acct}
              </Text>
            </View>
          </Pressable>
        )
      case 'hashtags':
        return (
          <Pressable
            style={[styles.itemDefault, { borderBottomColor: theme.border }]}
            onPress={() => {
              navigation.goBack()
              navigation.push('Screen-Shared-Hashtag', {
                hashtag: item.name
              })
            }}
          >
            <Text style={[styles.itemHashtag, { color: theme.primary }]}>
              #{item.name}
            </Text>
          </Pressable>
        )
      case 'statuses':
        return (
          <Pressable
            style={[
              styles.itemDefault,
              styles.itemAccount,
              { borderBottomColor: theme.border }
            ]}
            onPress={() => {
              navigation.goBack()
              navigation.push('Screen-Shared-Toot', { toot: item })
            }}
          >
            <Image
              source={{ uri: item.account.avatar_static }}
              style={styles.itemAccountAvatar}
            />
            <View>
              <Text numberOfLines={1}>
                <ParseEmojis
                  content={item.account.display_name || item.account.username}
                  emojis={item.account.emojis}
                  size='S'
                  fontBold
                />
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.itemAccountAcct, { color: theme.secondary }]}
              >
                @{item.account.acct}
              </Text>
              {item.content && (
                <View style={styles.itemStatus}>
                  <ParseHTML
                    content={item.content}
                    size='M'
                    emojis={item.emojis}
                    numberOfLines={2}
                  />
                </View>
              )}
            </View>
          </Pressable>
        )
      default:
        return null
    }
  }, [])

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={styles.searchBar}>
          <View
            style={[styles.searchField, { borderBottomColor: theme.secondary }]}
          >
            <Feather
              name='search'
              color={theme.primary}
              size={StyleConstants.Font.Size.M}
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.primary
                }
              ]}
              autoFocus
              onChangeText={onChangeText}
              autoCapitalize='none'
              autoCorrect={false}
              clearButtonMode='never'
              keyboardType='web-search'
              onSubmitEditing={({ nativeEvent: { text } }) =>
                setSearchTerm(text)
              }
              placeholder={'搜索些什么'}
              placeholderTextColor={theme.secondary}
              returnKeyType='go'
            />
          </View>
          <View style={styles.searchCancel}>
            <HeaderRight
              type='text'
              content='取消'
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
        <SectionList
          style={styles.base}
          renderItem={listItem}
          stickySectionHeadersEnabled
          sections={setctionData}
          ListEmptyComponent={listEmpty}
          keyboardShouldPersistTaps='always'
          renderSectionHeader={sectionHeader}
          renderSectionFooter={sectionFooter}
          keyExtractor={(item, index) => item + index}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingTop: 0
  },
  searchBar: {
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.25
  },
  searchIcon: {
    marginLeft: StyleConstants.Spacing.S
  },
  searchCancel: {
    paddingHorizontal: StyleConstants.Spacing.S,
    marginLeft: StyleConstants.Spacing.S
  },
  textInput: {
    flex: 1,
    padding: StyleConstants.Spacing.S,
    ...StyleConstants.FontStyle.M,
    marginRight: StyleConstants.Spacing.S
  },

  emptyBase: {
    marginTop: StyleConstants.Spacing.M,
    marginLeft:
      StyleConstants.Spacing.S +
      StyleConstants.Spacing.M +
      StyleConstants.Spacing.S
  },
  loading: { flex: 1, alignItems: 'center' },
  emptyFontSize: { ...StyleConstants.FontStyle.S },
  emptyFontBold: {
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  emptyDefault: {
    marginBottom: StyleConstants.Spacing.L
  },
  emptyAdvanced: {
    marginBottom: StyleConstants.Spacing.S
  },
  sectionHeader: {
    padding: StyleConstants.Spacing.M,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  sectionHeaderText: {
    ...StyleConstants.FontStyle.M,
    fontWeight: StyleConstants.Font.Weight.Bold,
    textAlign: 'center'
  },
  sectionFooter: {
    padding: StyleConstants.Spacing.S
  },
  sectionFooterText: {
    ...StyleConstants.FontStyle.S,
    textAlign: 'center'
  },
  itemDefault: {
    padding: StyleConstants.Spacing.S * 1.5,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemAccount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemAccountAvatar: {
    alignSelf: 'flex-start',
    width: StyleConstants.Avatar.S,
    height: StyleConstants.Avatar.S,
    borderRadius: 6,
    marginRight: StyleConstants.Spacing.S
  },
  itemAccountAcct: { marginTop: StyleConstants.Spacing.XS },
  itemHashtag: {
    ...StyleConstants.FontStyle.M
  },
  itemStatus: {
    marginTop: StyleConstants.Spacing.S
  }
})

export default ScreenSharedSearch
