import * as z from "zod"
import { toast } from "sonner"
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
import logo from "../../../assets/logo.png"

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  language: z.string().min(2).max(50),
})

export default function LoginPage() {
  const navigate = useNavigate()
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

  return (
    <PublicLayout
      className="flex flex-col justify-center items-center"
    >
      <div className="flex flex-col items-center p-12">
        <img className="mb-3" src={logo} width={80} />
        <h2 className="font-semibold text-2xl">LibreLinkUp Desktop</h2>
        <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
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
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(language => (
                            <SelectItem value={language.value} key={language.value}>
                              {language.label}
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem value={country.value} key={country.value}>
                              {country.label}
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
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-center mt-20">
              <Button type="submit" className="w-48">Log in</Button>
            </div>
          </div>
        </form>
      </Form>
    </PublicLayout>
  )
}
