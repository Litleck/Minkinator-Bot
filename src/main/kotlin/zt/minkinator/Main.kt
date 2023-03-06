package zt.minkinator

import com.kotlindiscord.kord.extensions.ExtensibleBot
import com.kotlindiscord.kord.extensions.utils.env
import com.kotlindiscord.kord.extensions.utils.loadModule
import dev.kord.common.Color
import dev.kord.core.kordLogger
import dev.kord.gateway.Intent
import dev.kord.gateway.PrivilegedIntent
import dev.kord.gateway.builder.Shards
import dev.kord.rest.builder.message.create.embed
import io.ktor.client.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json
import org.koin.core.module.dsl.singleOf
import org.komapper.core.dsl.Meta
import org.komapper.core.dsl.QueryDsl
import org.komapper.r2dbc.R2dbcDatabase
import zt.minkinator.data.filter
import zt.minkinator.data.guild
import zt.minkinator.data.markovConfig
import zt.minkinator.extension.*
import zt.minkinator.extension.filter.FilterExtension
import zt.minkinator.extension.media.EffectsExtension
import zt.minkinator.util.error
import zt.minkinator.util.unaryPlus

@OptIn(PrivilegedIntent::class)
suspend fun main() {
    val db = R2dbcDatabase("r2dbc:h2:file:///./database;DB_CLOSE_DELAY=-1")

    db.withTransaction {
        db.runQuery(QueryDsl.create(Meta.guild, Meta.filter, Meta.markovConfig))
    }

    val bot = ExtensibleBot(env("TOKEN")) {
        intents(false) {
            +Intent.GuildMessages
            +Intent.MessageContent
        }

        kord {
            stackTraceRecovery = true
        }

        extensions {
            +EventLogExtension
            +FilterExtension

            if (env("GPT").toBoolean()) {
                +GptExtension(apiKey = env("OPENAI_KEY"))
            } else {
                +MarkovExtension
            }

            +AvatarExtension
            +NameNormalizerExtension
            +AnimalsExtension
            +SpotifyExtension
            +PingExtension
            +RestrictedExtension
            +PurgeExtension
            +StickerExtension
            +GuildInfoExtension
            +UserInfoExtension
            +BanExtension
            +CoinTossExtension
            +EffectsExtension
            +PollExtension
            +KickExtension
            +RoleBoardExtension
            +MemberLogExtension
            +CaptionExtension
            +BigmojiExtension

            // Games
            +TicTacToeExtension
            +GuessmojiExtension
            +TriviaExtension
            +ConnectFourExtension

            helpExtensionBuilder.enableBundledExtension = false
            sentryExtensionBuilder.enable = false
        }

        pluginBuilder.enabled = false

        chatCommands {
            enabled = true
            defaultPrefix = ">"
        }

        members {
            fillPresences = true

            all()
        }

        presence {
            playing("with Kotlin")
        }

        sharding(::Shards)

        errorResponse { message, _ ->
            embed {
                color = Color.error
                title = "Error"
                description = message
            }
        }

        hooks {
            beforeKoinSetup {
                loadModule {
                    fun provideJson() = Json {
                        ignoreUnknownKeys = true
                        isLenient = true
                    }

                    fun provideHttpClient(json: Json) = HttpClient {
                        install(ContentNegotiation) {
                            json(json)
                        }
                    }

                    single { db }
                    singleOf(::provideJson)
                    singleOf(::provideHttpClient)
                }
            }
        }
    }

    Runtime.getRuntime().addShutdownHook(
        Thread {
            kordLogger.info("Shutting down...")
        }
    )

    bot.start()
}