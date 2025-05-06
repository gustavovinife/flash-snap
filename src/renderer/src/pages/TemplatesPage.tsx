import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../ui/common'
import { useNavigate } from 'react-router-dom'
import { Template, getTemplates, installTemplate } from '../services/templateService'
import { useDecks } from '../hooks/useDecks'
import { useCards } from '../hooks/useCards'
import { useSession } from '@renderer/context/SessionContext'
export default function TemplatesPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { createDeck } = useDecks()
  const { createManyCards } = useCards()

  const { user } = useSession()

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    // Load templates on component mount
    const loadTemplates = async (): Promise<void> => {
      try {
        const loadedTemplates = await getTemplates()
        setTemplates(loadedTemplates)
        setLoading(false)
      } catch (error) {
        console.error('Error loading templates:', error)
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  const handleBack = (): void => {
    if (selectedTemplate) {
      setSelectedTemplate(null)
    } else {
      navigate('/')
    }
  }

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectTemplate = (template: Template): void => {
    setSelectedTemplate(template)
  }

  const handleInstallTemplate = async (): Promise<void> => {
    if (!selectedTemplate) return

    // Install the template
    const newDeckId = await installTemplate(
      selectedTemplate,
      createDeck,
      createManyCards,
      user?.id ?? ''
    )

    // Navigate to the deck view
    navigate(`/deck/${newDeckId}`)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            {t('common.back')}
          </button>
          <h2 className="text-xl font-medium text-gray-800">{t('templates.title')}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {filteredTemplates.length} {t('templates.availableTemplates')}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder={t('templates.searchTemplates')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p>{t('common.loading')}</p>
        </div>
      ) : selectedTemplate ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              {selectedTemplate.emoji && <span className="text-2xl">{selectedTemplate.emoji}</span>}
              <h3 className="text-xl font-medium">{selectedTemplate.name}</h3>
            </div>
            <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                {selectedTemplate.type === 'language'
                  ? t('common.language')
                  : t('common.knowledge')}
              </div>
              {selectedTemplate.language && (
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                  {selectedTemplate.language}
                </div>
              )}
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                {selectedTemplate.cards.length} {t('common.cards')}
              </div>
            </div>

            <h4 className="font-medium text-gray-700 mb-3">{t('templates.previewCards')}</h4>
            <div className="space-y-2 mb-6">
              {selectedTemplate.cards.slice(0, 3).map((card, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-3">
                  <p className="font-medium">{card.front}</p>
                  <p className="text-gray-600 text-sm mt-1">{card.back}</p>
                  {card.content && <p className="text-gray-400 text-xs mt-1">{card.content}</p>}
                </div>
              ))}
              {selectedTemplate.cards.length > 3 && (
                <p className="text-sm text-gray-400">
                  {t('templates.andMore', { count: selectedTemplate.cards.length - 3 })}
                </p>
              )}
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              {t('common.back')}
            </button>
            <Button variant="primary" onClick={handleInstallTemplate}>
              {t('templates.install')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-200 overflow-hidden shadow-sm cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {template.emoji && <span className="text-xl">{template.emoji}</span>}
                  <h3 className="font-medium text-gray-800">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                    {template.type === 'language' ? t('common.language') : t('common.knowledge')}
                  </div>
                  {template.language && (
                    <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                      {template.language}
                    </div>
                  )}
                  <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                    {template.cards.length} {t('common.cards')}
                  </div>
                  {template.nationality && (
                    <div className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                      {template.nationality}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="container mt-12">
        <div className="flex justify-center items-center gap-2">
          <span className="text-sm text-gray-500">Do you want to submit a template?</span>
          <Button
            variant="outline"
            onClick={() => {
              window.open(
                'mailto:flashsnap@gmail.com?subject=Template Submission&body=I would like to submit a template for FlashSnap.',
                '_blank'
              )
            }}
          >
            Submit Template
          </Button>
        </div>
      </div>
    </div>
  )
}
