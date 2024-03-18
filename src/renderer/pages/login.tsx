import * as z from "zod"
import { toast } from "sonner"
import { useTranslation, Trans } from "react-i18next"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { PublicLayout } from "@/layouts/public-layout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAuthToken } from "@/lib/linkup"
import { countries, languages } from "@/config/app"
import { useAuthStore } from "@/stores/auth"
import { ButtonPopover } from "@/components/ui/button-popover"
import { QuestionMarkIcon } from "@radix-ui/react-icons"
import logo from "../../../assets/logo.png"

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  language: z.string().min(2).max(50),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const setLanguage = useAuthStore((state) => state.setLanguage)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      country: "",
      language: "",
    },
  })

  const login = useAuthStore((state) => state.login)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const authToken = await getAuthToken({
      country: values.country,
      username: values.username,
      password: values.password,
    })

    if (authToken) {
      login(authToken, values.country, values.language)
      navigate('/dashboard')
    } else {
      toast.error("Invalid credentials.")
    }
  }

  const setAndRefreshLanguage = (l: string) => {
    i18n.changeLanguage(l)
    setLanguage(l)
  }

  return (
    <PublicLayout
      className="flex flex-col justify-center items-center"
    >
      <div className="flex flex-col items-center p-12">
        <img className="mb-3" src={logo} width={80} />
        <h2 className="font-semibold text-2xl">LibreLinkUpDesktop</h2>
        <p className="text-gray-400">
          {t('Welcome')}
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full p-6"
        >
          <div className="flex flex-col justify-between ">
            <div className="grid grid-cols-2 gap-6 mt-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ t('Language')}</FormLabel>
                    <FormControl>
                      <Select onValueChange={(e) => {field.onChange(e);  setAndRefreshLanguage(e) }} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('SelectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(language => (
                            <SelectItem value={language.value} key={language.value}>
                              {t(language.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ t('Country') }</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={ t('SelectCountry') } />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem value={country.value} key={country.value}>
                              { t(country.label) }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ t('Username')}</FormLabel>
                    <FormControl>
                      <Input placeholder={ t('Username') } {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{ t('Password') }</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={ t('Password') } {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-center mt-20">
              <Button type="submit" className="w-48">{ t('LogIn') }</Button>
            </div>
          </div>
        </form>
      </Form>
      <div className="relative w-full flex-grow overflow-hidden flex">
        <ButtonPopover
          className="rounded-lg p-5
                  bg-popover text-card-foreground fill-current
                  shadow-md
                  mr-4
                  max-w-[300px]
             "
          contentProps={{ side: 'top', align: 'center' }}
        >
          {{
            trigger: (
              <button className="ml-auto block mr-5 mb-5 mt-auto hover:bg-white/20 p-2 transition-all border-solid border-[1px] rounded-[20px]">
                <QuestionMarkIcon className="h-4 w-4" />
              </button>
            ),
            content: (
              <div>
                <p className="text font-medium my-2">{t('getCredentialsTitle')}</p>
                <div>
                  <ol className="list-decimal pl-4 text-sm">
                    <li>
                    <Trans i18nKey="getCredentialsStep1">
          As sharing person, open your <a href={t('getCredentialsStep1Link')} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Libre smartphone app</a>, go to <em>Connected Apps</em>, click on <em>Manage</em> next to LibreLinkUp, click on <em>Add connection</em> and input the details for the account you wish to use with LibreLinkUpDesktop.
        </Trans>
                    </li>
                    <li>{t('getCredentialsStep2')}</li>
                    <li>{t('getCredentialsStep3')}</li>
                    <li>{t('getCredentialsStep4')}</li>
                  </ol>
                </div>
              </div>
            ),
          }}
        </ButtonPopover>
      </div>
    </PublicLayout>
  )
}
