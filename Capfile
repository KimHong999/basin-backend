require "capistrano/setup"
require "capistrano/deploy"
require 'capistrano/nvm'
require 'capistrano/yarn'
require "capistrano/scm/git"

install_plugin Capistrano::SCM::Git

Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }